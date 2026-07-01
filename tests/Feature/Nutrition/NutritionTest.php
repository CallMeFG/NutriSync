<?php

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use App\Services\OpenFoodFactsService;
use Illuminate\Support\Str;

test('patient can log nutrition and result_status is saved permanently', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'NT0001',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $uuid = (string) Str::uuid();

    $response = $this->actingAs($user)->post(route('patient.nutrition.store'), [
        'client_uuid' => $uuid,
        'barcode' => '8991234567890',
        'product_name' => 'Minuman Manis Kemasan',
        'sugar_g' => 35, // 35 / 50 = 70% -> Waspada (thresholds: >=40% waspada, >=80% bahaya)
        'serving_size_g' => 250,
        'scanned_at' => now()->format('Y-m-d H:i:s'),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('nutrition_logs', [
        'client_uuid' => $uuid,
        'product_name' => 'Minuman Manis Kemasan',
        'result_status' => 'waspada',
    ]);
});

test('offline sync processes batch logs idempotently using client_uuid', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'NT0002',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $uuid1 = (string) Str::uuid();
    $uuid2 = (string) Str::uuid();

    $payload = [
        'logs' => [
            [
                'client_uuid' => $uuid1,
                'barcode' => null,
                'product_name' => 'Kue Kering offline',
                'sugar_g' => 10,
                'serving_size_g' => 50,
                'scanned_at' => now()->subHours(2)->format('Y-m-d H:i:s'),
            ],
            [
                'client_uuid' => $uuid2,
                'barcode' => '8990001112223',
                'product_name' => 'Susu Kotak offline',
                'sugar_g' => 18,
                'serving_size_g' => 200,
                'scanned_at' => now()->subHour()->format('Y-m-d H:i:s'),
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson(route('patient.nutrition.sync-offline'), $payload);

    $response->assertStatus(200);
    $response->assertJsonStructure(['synced_uuids', 'message']);
    expect(count($response->json('synced_uuids')))->toBe(2);

    expect($patient->nutritionLogs()->count())->toBe(2);

    // Resend same payload to test idempotency
    $responseRetry = $this->actingAs($user)->postJson(route('patient.nutrition.sync-offline'), $payload);
    $responseRetry->assertStatus(200);

    expect($patient->nutritionLogs()->count())->toBe(2);
});

test('lookup barcode returns product when found or fallback message when not found', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'NT0003',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $this->mock(OpenFoodFactsService::class, function ($mock) {
        $mock->shouldReceive('lookup')->with('1234567890123')->andReturn([
            'product_name' => 'Teh Botol Test',
            'sugar_content_per_100g' => 8.5,
            'serving_size_g' => 250,
            'sugar_per_serving_g' => 21.25,
            'image_url' => null,
        ]);
        $mock->shouldReceive('lookup')->with('0000000000000')->andReturn(null);
    });

    $resFound = $this->actingAs($user)->getJson(route('patient.nutrition.lookup', ['barcode' => '1234567890123']));
    $resFound->assertStatus(200);
    $resFound->assertJson([
        'found' => true,
        'product' => ['product_name' => 'Teh Botol Test'],
    ]);

    $resNotFound = $this->actingAs($user)->getJson(route('patient.nutrition.lookup', ['barcode' => '0000000000000']));
    $resNotFound->assertStatus(200);
    $resNotFound->assertJson([
        'found' => false,
    ]);
});
