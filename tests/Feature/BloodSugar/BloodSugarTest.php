<?php

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Str;

test('patient can log blood sugar successfully with client_uuid idempotency', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'BS0001',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $uuid = (string) Str::uuid();

    $response = $this->actingAs($user)->post(route('patient.blood-sugar.store'), [
        'client_uuid' => $uuid,
        'glucose_level' => 115, // Waspada range
        'measurement_type' => 'puasa',
        'measurement_time' => now()->format('Y-m-d H:i:s'),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('blood_sugar_logs', [
        'client_uuid' => $uuid,
        'glucose_level' => 115,
        'measurement_type' => 'puasa',
    ]);

    // Check idempotency (submitting same UUID doesn't create duplicate record)
    $this->actingAs($user)->post(route('patient.blood-sugar.store'), [
        'client_uuid' => $uuid,
        'glucose_level' => 115,
        'measurement_type' => 'puasa',
        'measurement_time' => now()->format('Y-m-d H:i:s'),
    ]);

    expect($patient->bloodSugarLogs()->where('client_uuid', $uuid)->count())->toBe(1);
});

test('blood sugar level outside medical range fails validation', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'BS0002',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $response = $this->actingAs($user)->post(route('patient.blood-sugar.store'), [
        'client_uuid' => (string) Str::uuid(),
        'glucose_level' => 10, // Below min 20
        'measurement_type' => 'puasa',
        'measurement_time' => now()->format('Y-m-d H:i:s'),
    ]);

    $response->assertSessionHasErrors('glucose_level');

    $responseMax = $this->actingAs($user)->post(route('patient.blood-sugar.store'), [
        'client_uuid' => (string) Str::uuid(),
        'glucose_level' => 700, // Above max 600
        'measurement_type' => 'puasa',
        'measurement_time' => now()->format('Y-m-d H:i:s'),
    ]);

    $responseMax->assertSessionHasErrors('glucose_level');
});

test('caregiver cannot submit blood sugar log for patient', function () {
    $caregiver = User::factory()->create(['role' => UserRole::Caregiver]);

    $response = $this->actingAs($caregiver)->post(route('patient.blood-sugar.store'), [
        'client_uuid' => (string) Str::uuid(),
        'glucose_level' => 100,
        'measurement_type' => 'puasa',
        'measurement_time' => now()->format('Y-m-d H:i:s'),
    ]);

    $response->assertStatus(403);
});
