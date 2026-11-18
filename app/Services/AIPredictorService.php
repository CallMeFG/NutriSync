<?php

namespace App\Services;

use App\Enums\RiskStatus;
use App\Jobs\SendFamilySyncAlert;
use App\Models\AiRiskSnapshot;
use App\Models\Patient;
use Illuminate\Support\Facades\Cache;

class AIPredictorService
{
    public function __construct(
        private RiskThresholdService $thresholdService,
        private GeminiRecommendationService $geminiService
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

        // Penyesuaian berdasarkan BMI Klinis (Pediatric Z-Score WHO untuk ≤19 tahun, Adult BMI untuk >19 tahun)
        $ageYears = (int) ($patient->age ?? 16);
        if ($ageYears >= 10 && $ageYears <= 19) {
            $zScore = $this->calculatePediatricBmiZScore($bmi, $ageYears);
            if ($zScore >= 2.0) {
                $limit -= 10; // Obesitas Pediatrik (WHO >= +2 SD)
            } elseif ($zScore >= 1.0) {
                $limit -= 5;  // Overweight Pediatrik (WHO >= +1 SD)
            }
        } else {
            // Standar dewasa untuk usia > 19 tahun
            if ($bmi >= 30) {
                $limit -= 10;
            } elseif ($bmi >= 25) {
                $limit -= 5;
            }
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

        $recommendationText = $this->geminiService->generatePersonalizedRecommendation($patient, $newStatus, $newLimit);

        return $patient->riskSnapshots()->create([
            'status' => $newStatus,
            'computed_daily_limit_g' => $newLimit,
            'input_variables' => [
                'age' => $patient->age ?? 16,
                'bmi' => ($patient->height_cm > 0 && $patient->weight_kg > 0) ? round($patient->weight_kg / (($patient->height_cm / 100) * ($patient->height_cm / 100)), 1) : 22.0,
                'family_history' => (bool) $patient->family_diabetes_history,
                'avg_sugar_7d' => round($patient->nutritionLogs()->where('scanned_at', '>=', now()->subDays(7))->sum('sugar_per_serving_g') / 7, 1),
                'recommendation_text' => $recommendationText,
            ],
            'created_at' => now(),
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

        $this->awardGamificationActivity($patient);

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

        $this->awardGamificationActivity($patient);

        $this->updatePatientStatusAndNotify($patient, $newStatus);

        return $productStatus;
    }

    /**
     * Proses log aktivitas (minum air / olahraga) dan berikan poin gamifikasi serta streak harian.
     */
    public function processNewActivityLog(Patient $patient): void
    {
        $this->awardGamificationActivity($patient);
    }

    /**
     * Berikan poin gamifikasi dan streak harian dengan proteksi Anti-Cheat:
     * 1. Cooldown Anti-Spam 60 detik antar pemberian poin.
     * 2. Batas harian maksimal 50 poin per pasien per hari kalender.
     * 3. Streak hanya bertambah maksimal 1 kali per hari kalender.
     */
    private function awardGamificationActivity(Patient $patient): void
    {
        $cooldownKey = "user:{$patient->id}:gamification_cooldown";

        // 1. Cek Cooldown Anti-Spam 60 detik (atomic lock/add via Cache)
        if (! Cache::add($cooldownKey, true, 60)) {
            return; // Masih dalam cooldown, lewati penambahan poin/streak
        }

        // 2. Cek Batas Poin Harian (Maksimal 50 poin per hari)
        $todayKey = "user:{$patient->id}:points_awarded_".now()->toDateString();
        $awardedToday = (int) Cache::get($todayKey, 0);

        if ($awardedToday < 50) {
            $patient->increment('nutri_points', 10);
            Cache::put($todayKey, $awardedToday + 10, now()->endOfDay());
        }

        // 3. Cek Streak Harian (+1 per hari kalender)
        $streakKey = "user:{$patient->id}:streak_awarded_".now()->toDateString();
        if (Cache::add($streakKey, true, now()->endOfDay())) {
            $patient->increment('streak_count', 1);
        }
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
     * Narasi rekomendasi melalui Gemini AI API / fallback deterministik.
     */
    private function generateRuleBasedRecommendation(Patient $patient, RiskStatus $status, int $dailyLimit): string
    {
        return $this->geminiService->generatePersonalizedRecommendation($patient, $status, $dailyLimit);
    }

    /**
     * Kalkulasi pediatrik BMI-for-Age Z-Score berdasarkan WHO Growth Standards untuk remaja usia 10–19 tahun.
     */
    public function calculatePediatricBmiZScore(float $bmi, int $ageYears): float
    {
        // Standar rujukan median BMI & SD WHO 2007 (5-19 tahun)
        $whoStandards = [
            10 => ['median' => 16.6, 'sd' => 1.8],
            11 => ['median' => 17.2, 'sd' => 1.9],
            12 => ['median' => 17.8, 'sd' => 2.1],
            13 => ['median' => 18.5, 'sd' => 2.2],
            14 => ['median' => 19.2, 'sd' => 2.4],
            15 => ['median' => 19.9, 'sd' => 2.5],
            16 => ['median' => 20.5, 'sd' => 2.6],
            17 => ['median' => 21.0, 'sd' => 2.7],
            18 => ['median' => 21.3, 'sd' => 2.8],
            19 => ['median' => 21.5, 'sd' => 2.8],
        ];

        $ref = $whoStandards[$ageYears] ?? ['median' => 20.0, 'sd' => 2.5];

        return round(($bmi - $ref['median']) / max(0.1, $ref['sd']), 2);
    }
}
