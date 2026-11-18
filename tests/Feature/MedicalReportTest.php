<?php

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;

test('patient can access their own medical report export page', function () {
    $this->withoutVite();

    $user = User::factory()->create([
        'role' => UserRole::Patient,
    ]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'TESTMR',
        'birth_date' => '2008-05-15',
        'weight_kg' => 58.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 25,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $response = $this->actingAs($user)->get(route('patient.medical-report'));

    $response->assertStatus(200);
});

test('caregiver can access medical report of their monitored patient', function () {
    $this->withoutVite();

    $patientUser = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $patientUser->id,
        'pairing_code' => 'CGMON1',
        'birth_date' => '2009-01-01',
        'weight_kg' => 50,
        'height_cm' => 160,
        'daily_sugar_limit_g' => 25,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $caregiverUser = User::factory()->create(['role' => UserRole::Caregiver]);
    $caregiverUser->monitoredPatients()->attach($patient->id, [
        'status' => 'active',
    ]);

    $response = $this->actingAs($caregiverUser)->get(route('caregiver.patient.medical-report', $patient));

    $response->assertStatus(200);
});

test('caregiver cannot access medical report of unmonitored patient (IDOR protection)', function () {
    $patientUser = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $patientUser->id,
        'pairing_code' => 'UNMON1',
        'birth_date' => '2009-01-01',
        'weight_kg' => 50,
        'height_cm' => 160,
        'daily_sugar_limit_g' => 25,
        'current_risk_status' => RiskStatus::Aman,
    ]);

    $caregiverUser = User::factory()->create(['role' => UserRole::Caregiver]);
    // Tidak di-attach

    $response = $this->actingAs($caregiverUser)->get(route('caregiver.patient.medical-report', $patient));

    $response->assertStatus(403);
});
