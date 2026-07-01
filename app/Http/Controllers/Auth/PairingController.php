<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PairingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        if ($user->role === UserRole::FaskesAdmin) {
            return redirect()->route('dashboard');
        }

        if ($user->role === UserRole::Patient) {
            $patient = $user->patient;
            if (! $patient) {
                // Defensive: jika karena alasan tertentu profil patient belum ada, buatkan sekarang
                $patient = $user->patient()->create([
                    'pairing_code' => 'NS'.strtoupper(Str::random(4)),
                    'birth_date' => now()->subYears(15)->format('Y-m-d'),
                    'weight_kg' => 50.0,
                    'height_cm' => 160.0,
                    'daily_sugar_limit_g' => config('nutrisync.default_daily_sugar_limit_g', 50),
                    'current_risk_status' => RiskStatus::Aman,
                ]);
            }

            $caregivers = $patient->caregivers()->get(['users.id', 'users.name', 'users.email', 'caregiver_patient.paired_at']);

            return Inertia::render('Auth/Pairing', [
                'role' => 'patient',
                'pairingCode' => $patient->pairing_code,
                'caregivers' => $caregivers,
                'status' => session('status'),
            ]);
        }

        // Role Caregiver
        $monitoredPatients = $user->monitoredPatients()->with('user:id,name,email')->get();

        return Inertia::render('Auth/Pairing', [
            'role' => 'caregiver',
            'monitoredPatients' => $monitoredPatients,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== UserRole::Caregiver) {
            return back()->withErrors(['pairing_code' => 'Hanya pendamping (caregiver) yang dapat menambahkan kode pairing.']);
        }

        $request->validate([
            'pairing_code' => ['required', 'string', 'min:6', 'max:8'],
        ]);

        $code = strtoupper(trim($request->pairing_code));
        $patient = Patient::with('user')->where('pairing_code', $code)->first();

        if (! $patient) {
            return back()->withErrors(['pairing_code' => 'Kode pairing tidak ditemukan. Pastikan kode yang dimasukkan tepat 6 karakter dari aplikasi pasien.']);
        }

        if ($user->monitoredPatients()->where('patient_id', $patient->id)->exists()) {
            return back()->withErrors(['pairing_code' => 'Anda sudah memantau pasien ini sebelumnya.']);
        }

        $user->monitoredPatients()->attach($patient->id, [
            'status' => 'active',
            'paired_at' => now(),
        ]);

        return back()->with('status', 'Berhasil menghubungkan ke pasien: '.($patient->user->name ?? 'Pasien'));
    }

    public function skip(Request $request): RedirectResponse
    {
        return redirect()->route('dashboard');
    }
}
