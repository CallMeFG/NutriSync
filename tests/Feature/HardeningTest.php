<?php

use App\Models\LocalProduct;
use App\Models\Patient;
use App\Models\User;
use App\Services\AIPredictorService;
use App\Services\OpenFoodFactsService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('OpenFoodFactsService cacheProduct saves UMKM or barcode product accurately to database', function () {
    $service = app(OpenFoodFactsService::class);

    $cached = $service->cacheProduct(
        barcode: '8991234567890',
        productName: 'Teh Hijau Lokal UMKM',
        sugarPerServingG: 12.5,
        servingSizeG: 250
    );

    expect($cached)->toBeInstanceOf(LocalProduct::class)
        ->and($cached->barcode)->toBe('8991234567890')
        ->and($cached->product_name)->toBe('Teh Hijau Lokal UMKM')
        ->and($cached->sugar_per_serving_g)->toEqual(12.5)
        ->and(LocalProduct::where('barcode', '8991234567890')->exists())->toBeTrue();
});

test('AIPredictorService calculates WHO Pediatric BMI-for-Age Z-Score for adolescents', function () {
    $service = app(AIPredictorService::class);

    // Usia 16 tahun WHO ref median = 20.5, SD = 2.6
    // BMI = 25.7 => (25.7 - 20.5) / 2.6 = 2.0 Z-Score (+2 SD Obesitas Pediatrik)
    $zScore = $service->calculatePediatricBmiZScore(25.7, 16);

    expect($zScore)->toBe(2.0);
});

test('AIPredictorService adjusts daily sugar limit based on pediatric BMI Z-score', function () {
    $service = app(AIPredictorService::class);

    $user = User::factory()->create();
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'TEST99',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'height_cm' => 160,
        'weight_kg' => 66, // BMI = 66 / (1.6*1.6) = 25.78 => Z-Score >= 2.0 (+2 SD)
        'family_diabetes_history' => false,
    ]);

    $limit = $service->calculateDailySugarLimit($patient);

    // Base default 25 - 10 (Pediatric Obese >= +2 SD) = 15
    expect($limit)->toBe(15);
});
