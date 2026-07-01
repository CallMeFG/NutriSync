<?php

use App\Enums\UserRole;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laragear\WebAuthn\Http\Routes as WebAuthnRoutes;

Route::get('/', function () {
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
    Route::get('/dashboard', function () {
        return Inertia::render('Patient/Dashboard');
    })->name('dashboard');
});

// ─── Grup Route untuk Caregiver (Orang Tua / Wali) ────────────────────────────
Route::middleware(['auth', 'verified', 'role:caregiver'])->prefix('caregiver')->name('caregiver.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Caregiver/Dashboard');
    })->name('dashboard');
});

// ─── Grup Route untuk Faskes Admin ────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:faskes_admin'])->prefix('faskes')->name('faskes.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Faskes/Dashboard');
    })->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

WebAuthnRoutes::register();

require __DIR__.'/auth.php';
