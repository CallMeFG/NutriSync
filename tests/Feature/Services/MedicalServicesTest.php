<?php

use App\Enums\RiskStatus;
use App\Models\Patient;
use App\Models\User;
use App\Services\AIPredictorService;
use App\Services\RiskThresholdService;

test('risk threshold service evaluates fasting glucose correctly according to PERKENI guidelines', function () {
    $service = app(RiskThresholdService::class);

    expect($service->assessGlucoseStatus(85))->toBe(RiskStatus::Aman)
        ->and($service->assessGlucoseStatus(110))->toBe(RiskStatus::Waspada)
        ->and($service->assessGlucoseStatus(130))->toBe(RiskStatus::Bahaya);
});

test('risk threshold service evaluates product score correctly according to daily sugar percentage', function () {
    $service = app(RiskThresholdService::class);

    expect($service->assessProductScore(20.0))->toBe(RiskStatus::Aman)
        ->and($service->assessProductScore(50.0))->toBe(RiskStatus::Waspada)
        ->and($service->assessProductScore(90.0))->toBe(RiskStatus::Bahaya);
});

test('ai predictor service calculates daily sugar limit deterministically and respects minimum bound', function () {
    $service = app(AIPredictorService::class);

    $user = User::factory()->create(['role' => 'patient']);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'TEST01',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 95.0,
        'height_cm' => 150.0, // High BMI
        'family_diabetes_history' => true,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $limit = $service->calculateDailySugarLimit($patient);

    expect($limit)->toBeGreaterThanOrEqual(15)
        ->and($limit)->toBeLessThanOrEqual(config('nutrisync.default_daily_sugar_limit_g', 50));
});
