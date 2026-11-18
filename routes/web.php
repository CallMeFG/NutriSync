<?php

use App\Enums\UserRole;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\BloodSugarController;
use App\Http\Controllers\FaskesController;
use App\Http\Controllers\MedicalReportController;
use App\Http\Controllers\NutritionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RewardController;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laragear\WebAuthn\Http\Routes as WebAuthnRoutes;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    $role = $request->user()->role;
    if ($role === UserRole::Patient) {
        return redirect()->route('patient.dashboard');
    }
    if ($role === UserRole::Caregiver) {
        return redirect()->route('caregiver.dashboard');
    }
    if ($role === UserRole::FaskesAdmin) {
        return redirect()->route('faskes.dashboard');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ─── Grup Route untuk Patient (Remaja) ────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:patient'])->prefix('patient')->name('patient.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $patient = $request->user()->patient;

        // Data riwayat terakhir (untuk tabel ringkasan)
        $recentBloodSugarLogs = $patient ? $patient->bloodSugarLogs()->orderByDesc('measurement_time')->take(5)->get() : [];
        $recentNutritionLogs = $patient ? $patient->nutritionLogs()->orderByDesc('scanned_at')->take(5)->get() : [];
        $recentActivityLogs = $patient ? $patient->activityLogs()->orderByDesc('logged_at')->take(5)->get() : [];

        $todayWater = $patient ? (int) $patient->activityLogs()->where('type', 'water')->whereDate('logged_at', now()->toDateString())->sum('value') : 0;
        $todayExercise = $patient ? (int) $patient->activityLogs()->where('type', 'exercise')->whereDate('logged_at', now()->toDateString())->sum('value') : 0;

        // Data chart: trend gula darah 14 entri terakhir (oldest→newest untuk X-axis)
        $chartBloodSugarLogs = [];
        if ($patient) {
            $chartBloodSugarLogs = $patient->bloodSugarLogs()
                ->orderByDesc('measurement_time')
                ->take(14)
                ->get(['id', 'glucose_level', 'measurement_time', 'measurement_type'])
                ->reverse()
                ->values();
        }

        // Data chart: konsumsi gula harian 7 hari terakhir (agregasi per hari)
        $chartDailySugar = [];
        if ($patient) {
            $limit = $patient->daily_sugar_limit_g ?? config('nutrisync.default_daily_sugar_limit_g', 25);
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $totalSugar = $patient->nutritionLogs()
                    ->whereDate('scanned_at', $date->toDateString())
                    ->sum('sugar_per_serving_g');
                $chartDailySugar[] = [
                    'date' => $date->format('d/m'),
                    'day' => $date->translatedFormat('D'),
                    'total_sugar' => round((float) $totalSugar, 1),
                    'limit' => $limit,
                ];
            }
        }

        $latestGlucose = $recentBloodSugarLogs->first();
        
        // Ambil narasi dari snapshot terbaru atau generate melalui GeminiRecommendationService
        $latestSnapshot = $patient ? $patient->riskSnapshots()->latest('created_at')->first() : null;
        $snapshotRecText = $latestSnapshot ? ($latestSnapshot->input_variables['recommendation_text'] ?? null) : null;
        if (!empty($snapshotRecText)) {
            $aiRecommendation = $snapshotRecText;
        } elseif ($patient) {
            $aiRecommendation = app(\App\Services\GeminiRecommendationService::class)->generatePersonalizedRecommendation(
                $patient,
                $patient->current_risk_status ?? \App\Enums\RiskStatus::Aman,
                $patient->daily_sugar_limit_g ?? 25
            );
        } else {
            $aiRecommendation = 'Pertahankan pola makan sehat rendah gula serta rutin berolahraga 30 menit per hari untuk menjaga stabilitas gula darah.';
        }

        return Inertia::render('Patient/Dashboard', [
            'recentBloodSugarLogs' => $recentBloodSugarLogs,
            'recentNutritionLogs' => $recentNutritionLogs,
            'recentActivityLogs' => $recentActivityLogs,
            'todayWater' => $todayWater,
            'todayExercise' => $todayExercise,
            'chartBloodSugarLogs' => $chartBloodSugarLogs,
            'chartDailySugar' => $chartDailySugar,
            'latestGlucose' => $latestGlucose,
            'streak' => $patient ? ($patient->streak_count ?? 0) : 0,
            'nutriPoints' => $patient ? ($patient->nutri_points ?? 0) : 0,
            'pointsDelta' => 10,
            'aiRecommendation' => $aiRecommendation,
        ]);
    })->name('dashboard');

    // Ringkasan Kesehatan & Insights
    Route::get('/health-summary', function (Request $request) {
        $patient = $request->user()->patient;
        $logs = $patient ? $patient->bloodSugarLogs()->orderByDesc('measurement_time')->take(30)->get() : collect([]);

        $glucoseValues = $logs->pluck('glucose_level')->filter()->map(fn ($v) => (int) $v);
        $avg = $glucoseValues->count() > 0 ? (int) round($glucoseValues->avg()) : null;
        $high = $glucoseValues->count() > 0 ? $glucoseValues->max() : null;
        $low = $glucoseValues->count() > 0 ? $glucoseValues->min() : null;

        // Time in range 70-140 mg/dL
        $tirCount = $glucoseValues->filter(fn ($v) => $v >= 70 && $v <= 140)->count();
        $totalCount = $glucoseValues->count();
        $tirPct = $totalCount > 0 ? (int) round(($tirCount / $totalCount) * 100) : null;

        return Inertia::render('Patient/HealthSummary/Index', [
            'riskStatus' => $patient->current_risk_status ?? 'aman',
            'averageGlucose' => $avg,
            'timeInRange' => $tirPct,
            'timeInRangeCount' => $totalCount > 0 ? $tirCount : null,
            'timeInRangeTotal' => $totalCount > 0 ? $totalCount : null,
            'highestGlucose' => $high,
            'lowestGlucose' => $low,
            'recommendations' => [
                'Pertahankan konsumsi makanan dengan indeks glikemik rendah.',
                'Lakukan aktivitas aerobik atau jalan kaki minimal 30 menit sehari.',
                'Tidur cukup 7-8 jam setiap malam untuk mendukung kestabilan metabolisme tubuh.',
            ],
            'dateRangeLabel' => now()->subDays(30)->translatedFormat('j F Y').' – '.now()->translatedFormat('j F Y'),
        ]);
    })->name('health-summary');

    // Fitur Gula Darah & HbA1c
    Route::get('/blood-sugar', [BloodSugarController::class, 'index'])->name('blood-sugar.index');
    Route::get('/blood-sugar/trend', [BloodSugarController::class, 'trend'])->name('blood-sugar.trend');
    Route::post('/blood-sugar', [BloodSugarController::class, 'store'])->name('blood-sugar.store');
    Route::post('/blood-sugar/sync-offline', [BloodSugarController::class, 'syncOffline'])->name('blood-sugar.sync-offline');

    // Fitur Pindai Nutrisi / Scan Barcode
    Route::get('/nutrition', [NutritionController::class, 'index'])->name('nutrition.index');
    Route::post('/nutrition', [NutritionController::class, 'store'])->name('nutrition.store');
    // Throttle 30 req/mnt per user — mencegah abuse/bot scraping ke OpenFoodFacts API eksternal
    Route::get('/nutrition/lookup', [NutritionController::class, 'lookupBarcode'])->middleware('throttle:30,1')->name('nutrition.lookup');
    Route::post('/nutrition/sync-offline', [NutritionController::class, 'syncOffline'])->name('nutrition.sync-offline');

    // Fitur Pelacakan Aktivitas & Air Minum
    Route::get('/activity', [ActivityController::class, 'index'])->name('activity.index');
    Route::post('/activity', [ActivityController::class, 'store'])->name('activity.store');

    // Fitur Gamifikasi & Rewards
    Route::get('/rewards', [RewardController::class, 'index'])->name('rewards.index');
    Route::post('/rewards/{reward}/claim', [RewardController::class, 'claim'])->name('rewards.claim');

    // Fitur Ekspor Laporan Medis Digital (Siap Cetak / PDF)
    Route::get('/medical-report', [MedicalReportController::class, 'exportPatient'])->name('medical-report');

    // Fitur Family Sync (Status & Daftar Notifikasi ke Orang Tua)
    Route::get('/family-sync', function (Request $request) {
        $patient = $request->user()->patient?->load('caregivers');

        $emergencyAlerts = [];
        if ($patient) {
            $emergencyAlerts = $patient->bloodSugarLogs()
                ->where('glucose_level', '>=', 100)
                ->orderByDesc('measurement_time')
                ->take(10)
                ->get()
                ->map(function ($log) {
                    $isDanger = $log->glucose_level >= 126;

                    return [
                        'id' => $log->id,
                        'title' => $isDanger ? '⚠️ Peringatan Darurat: Gula Darah Tinggi ('.$log->glucose_level.' mg/dL)' : '🔔 Notifikasi Waspada: Glukosa Meningkat ('.$log->glucose_level.' mg/dL)',
                        'message' => $isDanger
                            ? 'Pesan otomatis telah dikirim via WhatsApp ke Orang Tua / Wali untuk pantauan darurat.'
                            : 'Peringatan waspada tercatat dan disinkronisasikan di log Family Sync.',
                        'type' => $isDanger ? 'bahaya' : 'waspada',
                        'time' => $log->measurement_time ? Carbon::parse($log->measurement_time)->translatedFormat('d M Y, H:i') : '',
                        'sent_via' => 'WhatsApp / Fonnte',
                    ];
                });
        }

        return Inertia::render('Patient/FamilySync/Index', [
            'patient' => $patient,
            'pairingCode' => $patient?->pairing_code ?? 'SYNC123',
            'caregivers' => $patient?->caregivers ?? [],
            'alerts' => $emergencyAlerts,
        ]);
    })->name('family-sync.index');
});

// ─── Grup Route untuk Caregiver (Orang Tua / Wali) ────────────────────────────
Route::middleware(['auth', 'verified', 'role:caregiver'])->prefix('caregiver')->name('caregiver.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $patients = $request->user()->monitoredPatients()
            ->with(['user', 'bloodSugarLogs' => fn ($q) => $q->latest('measurement_time')->limit(1)])
            ->get();

        return Inertia::render('Caregiver/Dashboard', [
            'patients' => $patients,
            'todayTip' => 'Remaja sering merasa tertekan oleh batasan makanan. Gunakan pendekatan positif dengan menawarkan alternatif sehat dan pujian saat mereka memenuhi target harian.',
        ]);
    })->name('dashboard');

    Route::get('/patient/{patient}/blood-sugar', [BloodSugarController::class, 'show'])->name('patient.blood-sugar');
    Route::get('/patient/{patient}/medical-report', [MedicalReportController::class, 'exportCaregiver'])->name('patient.medical-report');
    Route::get('/patient/{patient}/quick-message', function (Request $request, Patient $patient) {
        Gate::authorize('view', $patient);

        return Inertia::render('Caregiver/QuickMessage', [
            'patient' => $patient->load('user'),
        ]);
    })->name('quick-message');
});

// ─── Grup Route untuk Faskes Admin ────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:faskes_admin'])->prefix('faskes')->name('faskes.')->group(function () {
    Route::get('/dashboard', [FaskesController::class, 'index'])->name('dashboard');
    Route::get('/risk-distribution', [FaskesController::class, 'riskDistribution'])->name('risk-distribution');
    Route::get('/report', [FaskesController::class, 'report'])->name('report');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

WebAuthnRoutes::register();

require __DIR__.'/auth.php';
