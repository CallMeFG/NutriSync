<?php

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use App\Services\AIPredictorService;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

test('first log awards 10 points and increments streak count once', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'ACG001',
        'birth_date' => '2008-01-01',
        'weight_kg' => 60,
        'height_cm' => 165,
        'daily_sugar_limit_g' => 25,
        'current_risk_status' => RiskStatus::Aman,
        'nutri_points' => 100,
        'streak_count' => 3,
    ]);

    $service = app(AIPredictorService::class);
    $service->processNewBloodSugarLog($patient, 95);

    $patient->refresh();
    expect($patient->nutri_points)->toBe(110)
        ->and($patient->streak_count)->toBe(4);
});

test('cooldown prevents double point earning within 60 seconds', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'ACG002',
        'birth_date' => '2008-01-01',
        'weight_kg' => 60,
        'height_cm' => 165,
        'daily_sugar_limit_g' => 25,
        'current_risk_status' => RiskStatus::Aman,
        'nutri_points' => 100,
        'streak_count' => 3,
    ]);

    $service = app(AIPredictorService::class);

    // Log pertama
    $service->processNewBloodSugarLog($patient, 95);
    // Log kedua langsung dalam <60 detik
    $service->processNewNutritionLog($patient, 12);

    $patient->refresh();
    expect($patient->nutri_points)->toBe(110) // Tetap 110 (bukan 120)
        ->and($patient->streak_count)->toBe(4); // Tetap 4 (bukan 5)
});
