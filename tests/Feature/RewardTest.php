<?php

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\Reward;
use App\Models\User;

test('patient can view rewards index page', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'RW0001',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
        'nutri_points' => 100,
        'streak_count' => 5,
    ]);

    Reward::create([
        'title' => 'Voucher Buah Segar Rp 50.000',
        'description' => 'Diskon pembelian buah segar',
        'points_required' => 50,
        'stock' => 10,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->get(route('patient.rewards.index'));
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Patient/Rewards/Index')
        ->has('rewards', 1)
        ->where('nutriPoints', 100)
    );
});

test('patient can claim reward when points are sufficient', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'RW0002',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
        'nutri_points' => 100,
    ]);

    $reward = Reward::create([
        'title' => 'Voucher Salad 30%',
        'description' => 'Diskon salad sehat',
        'points_required' => 30,
        'stock' => 5,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('patient.rewards.claim', $reward));
    $response->assertRedirect();
    $response->assertSessionHas('success');

    $patient->refresh();
    $reward->refresh();

    expect($patient->nutri_points)->toBe(70);
    expect($reward->stock)->toBe(4);
    expect($patient->rewardClaims()->count())->toBe(1);
});

test('patient cannot claim reward when points are insufficient', function () {
    $user = User::factory()->create(['role' => UserRole::Patient]);
    $patient = Patient::create([
        'user_id' => $user->id,
        'pairing_code' => 'RW0003',
        'birth_date' => now()->subYears(16)->format('Y-m-d'),
        'weight_kg' => 55.0,
        'height_cm' => 165.0,
        'daily_sugar_limit_g' => 50,
        'current_risk_status' => RiskStatus::Aman,
        'nutri_points' => 10,
    ]);

    $reward = Reward::create([
        'title' => 'Voucher Gym 1 Bulan',
        'description' => 'Akses gym gratis',
        'points_required' => 100,
        'stock' => 5,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('patient.rewards.claim', $reward));
    $response->assertRedirect();
    $response->assertSessionHasErrors('reward');

    $patient->refresh();
    $reward->refresh();

    expect($patient->nutri_points)->toBe(10);
    expect($reward->stock)->toBe(5);
    expect($patient->rewardClaims()->count())->toBe(0);
});
