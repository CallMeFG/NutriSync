<?php

use App\Models\User;
use App\Services\DeviceTrustService;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users logging in from new device are redirected to step up verification', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('stepup.show'));
    $response->assertSessionHas('pending_2fa_user_id', $user->id);
});

test('trusted users can authenticate using the login screen directly', function () {
    $user = User::factory()->create();

    $this->mock(DeviceTrustService::class, function ($mock) {
        $mock->shouldReceive('isTrusted')->andReturn(true);
        $mock->shouldReceive('trustThisDevice')->andReturn(cookie('trusted_device', 'test', 43200));
    });

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
