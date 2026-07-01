<?php

namespace App\Services;

use App\Enums\RiskStatus;
use App\Jobs\SendFamilySyncAlert;
use App\Models\AiRiskSnapshot;
use App\Models\Patient;

class AIPredictorService
{
    public function __construct(
        private RiskThresholdService $thresholdService
    ) {}

    /**
     * Hitung ambang batas gula harian pasien berdasarkan formula rule-based/deterministik.
     * Tidak mengandalkan LLM agar angka kritis selalu dapat diaudit, cepat, dan tidak gagal/timeout.
     */
    public function calculateDailySugarLimit(Patient $patient): int
    {
        $baseLimit = config('nutrisync.default_daily_sugar_limit_g', 25);

        // Kalkulasi BMI jika berat dan tinggi tersedia
        $bmi = 22.0;
        if ($patient->height_cm > 0 && $patient->weight_kg > 0) {
            $heightM = $patient->height_cm / 100;
            $bmi = $patient->weight_kg / ($heightM * $heightM);
        }

        $limit = (float) $baseLimit;

        // Penyesuaian berdasarkan BMI (Overweight >= 25, Obese >= 30)
        if ($bmi >= 30) {
            $limit -= 10;
        } elseif ($bmi >= 25) {
            $limit -= 5;
        }

        // Penyesuaian berdasarkan riwayat diabetes keluarga
        if ($patient->family_diabetes_history) {
            $limit -= 5;
        }

        // Penyesuaian berdasarkan rata-rata konsumsi gula 7 hari terakhir
        $sevenDaysAgo = now()->subDays(7);
        $totalSugar7Days = $patient->nutritionLogs()
            ->where('scanned_at', '>=', $sevenDaysAgo)
            ->sum('sugar_per_serving_g');

        $avgDailySugar = $totalSugar7Days / 7;

        if ($avgDailySugar > 40) {
            $limit -= 5; // Ketatkan batas jika kebiasaan konsumsi tinggi
        }

        // Aturan wajib: Hasil kalkulasi limit WAJIB dibungkus max() — tidak boleh 0 atau negatif
        return max(15, (int) round($limit));
    }

    /**
     * Jalankan personalisasi ulang (recalculation) untuk batas harian & status risiko.
     * Menyimpan snapshot riwayat ke tabel ai_risk_snapshots.
     */
    public function recalculatePersonalization(Patient $patient): AiRiskSnapshot
    {
        $newLimit = $this->calculateDailySugarLimit($patient);

        // Evaluasi status risiko keseluruhan saat ini
        $latestSugarLog = $patient->bloodSugarLogs()->latest('measurement_time')->first();
        $newStatus = $latestSugarLog
            ? $this->thresholdService->assessGlucoseStatus($latestSugarLog->glucose_level)
            : $patient->current_risk_status;

        // Cek juga konsumsi hari ini vs batas baru
        $todaySugar = $patient->nutritionLogs()
            ->whereDate('scanned_at', now()->toDateString())
            ->sum('sugar_per_serving_g');

        if ($todaySugar >= $newLimit * 1.5) {
            $newStatus = RiskStatus::Bahaya;
        } elseif ($todaySugar >= $newLimit && $newStatus === RiskStatus::Aman) {
            $newStatus = RiskStatus::Waspada;
        }

        $patient->update([
            'daily_sugar_limit_g' => $newLimit,
            'risk_recalculated_at' => now(),
        ]);

        $this->updatePatientStatusAndNotify($patient, $newStatus);

        return $patient->riskSnapshots()->create([
            'risk_level' => $newStatus,
            'daily_limit_g' => $newLimit,
            'recommendation_text' => $this->generateRuleBasedRecommendation($patient, $newStatus, $newLimit),
            'snapshot_date' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Evaluasi skor risiko satu produk makanan/minuman berdasarkan batas harian pasien.
     */
    public function scoreProduct(Patient $patient, float $productSugarGrams): RiskStatus
    {
        $dailyLimit = max(1, $patient->daily_sugar_limit_g);
        $percentage = ($productSugarGrams / $dailyLimit) * 100;

        return $this->thresholdService->assessProductScore($percentage);
    }

    /**
     * Proses log gula darah baru dari pasien dan trigger evaluasi risiko.
     */
    public function processNewBloodSugarLog(Patient $patient, int $glucoseLevel): RiskStatus
    {
        $newStatus = $this->thresholdService->assessGlucoseStatus($glucoseLevel);

        $this->updatePatientStatusAndNotify($patient, $newStatus);

        return $newStatus;
    }

    /**
     * Proses log nutrisi baru dan evaluasi akumulasi konsumsi harian.
     */
    public function processNewNutritionLog(Patient $patient, float $sugarGrams): RiskStatus
    {
        $productStatus = $this->scoreProduct($patient, $sugarGrams);

        $todaySugar = $patient->nutritionLogs()
            ->whereDate('scanned_at', now()->toDateString())
            ->sum('sugar_per_serving_g');

        $currentStatus = $patient->current_risk_status;
        $newStatus = $currentStatus;

        if ($todaySugar >= $patient->daily_sugar_limit_g * 1.5) {
            $newStatus = RiskStatus::Bahaya;
        } elseif ($todaySugar >= $patient->daily_sugar_limit_g && $currentStatus === RiskStatus::Aman) {
            $newStatus = RiskStatus::Waspada;
        }

        $this->updatePatientStatusAndNotify($patient, $newStatus);

        return $productStatus;
    }

    /**
     * SATU-SATUNYA titik yang boleh mengubah patient.current_risk_status dan dispatch notifikasi.
     * Mencegah duplikasi logic dan menjamin konsistensi di seluruh sistem.
     */
    private function updatePatientStatusAndNotify(Patient $patient, RiskStatus $newStatus): void
    {
        $oldStatus = $patient->current_risk_status;

        if ($oldStatus !== $newStatus) {
            $patient->update(['current_risk_status' => $newStatus]);

            if ($newStatus === RiskStatus::Bahaya) {
                // WAJIB async lewat Job (queue), tidak dipanggil sync di controller
                SendFamilySyncAlert::dispatch(
                    $patient,
                    "Peringatan Darurat NutriSync: Status risiko diabetes anak Anda ({$patient->user->name}) meningkat menjadi BAHAYA. Segera periksa asupan gizi atau konsultasikan ke faskes."
                );
            }
        }
    }

    /**
     * Narasi rekomendasi deterministik tanpa LLM untuk phase MVP.
     */
    private function generateRuleBasedRecommendation(Patient $patient, RiskStatus $status, int $dailyLimit): string
    {
        $statusText = strtoupper($status->value);

        return "Batas asupan gula harian Anda adalah {$dailyLimit} gram/hari. Status risiko terkini: {$statusText}. Pertahankan konsumsi air putih, hindari minuman manis kemasan, dan rutin lakukan aktivitas fisik minimal 30 menit sehari.";
    }
}
