<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Services\AIPredictorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MedicalReportController extends Controller
{
    public function __construct(
        private AIPredictorService $aiPredictorService
    ) {}

    /**
     * Tampilkan laporan medis untuk diunduh/dicetak dari akun Pasien Remaja.
     */
    public function exportPatient(Request $request): Response
    {
        $patient = $request->user()->patient;

        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        return $this->renderReport($patient);
    }

    /**
     * Tampilkan laporan medis dari akun Caregiver (Orang Tua).
     * WAJIB menggunakan $this->authorize('view', $patient) sesuai aturan AGENTS.md #4.
     */
    public function exportCaregiver(Request $request, Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        return $this->renderReport($patient);
    }

    /**
     * Susun data klinis 14 hari terakhir dan render ke halaman cetak laporan medis.
     */
    private function renderReport(Patient $patient): Response
    {
        $patient->load('user');

        $fourteenDaysAgo = now()->subDays(14);

        $bloodSugarLogs = $patient->bloodSugarLogs()
            ->where('measurement_time', '>=', $fourteenDaysAgo)
            ->orderByDesc('measurement_time')
            ->get();

        $nutritionLogs = $patient->nutritionLogs()
            ->where('scanned_at', '>=', $fourteenDaysAgo)
            ->orderByDesc('scanned_at')
            ->get();

        $avgGlucose = $bloodSugarLogs->count() > 0
            ? round($bloodSugarLogs->avg('glucose_level'), 1)
            : 0;

        $totalSugar14Days = round($nutritionLogs->sum('sugar_per_serving_g'), 1);

        // Kalkulasi WHO Pediatric BMI-for-Age Z-Score
        $bmi = 22.0;
        if ($patient->height_cm > 0 && $patient->weight_kg > 0) {
            $heightM = $patient->height_cm / 100;
            $bmi = round($patient->weight_kg / ($heightM * $heightM), 2);
        }

        $ageYears = (int) ($patient->age ?? 16);
        $zScore = $this->aiPredictorService->calculatePediatricBmiZScore($bmi, $ageYears);

        return Inertia::render('Patient/MedicalReport/ShowcaseReport', [
            'patient' => [
                'name' => $patient->user->name ?? 'Remaja NutriSync',
                'email' => $patient->user->email ?? '',
                'pairing_code' => $patient->pairing_code,
                'birth_date' => $patient->birth_date?->format('d M Y'),
                'age' => $ageYears,
                'weight_kg' => (float) $patient->weight_kg,
                'height_cm' => (float) $patient->height_cm,
                'bmi' => $bmi,
                'who_z_score' => $zScore,
                'daily_sugar_limit_g' => $patient->daily_sugar_limit_g,
                'current_risk_status' => $patient->current_risk_status->value,
                'family_history' => (bool) $patient->family_diabetes_history,
            ],
            'stats' => [
                'avg_glucose_mg_dl' => $avgGlucose,
                'total_sugar_14_days_g' => $totalSugar14Days,
                'blood_sugar_logs_count' => $bloodSugarLogs->count(),
                'nutrition_logs_count' => $nutritionLogs->count(),
                'report_generated_at' => now()->setTimezone('Asia/Jakarta')->format('d M Y, H:i').' WIB',
            ],
            'bloodSugarLogs' => $bloodSugarLogs,
            'nutritionLogs' => $nutritionLogs,
        ]);
    }
}
