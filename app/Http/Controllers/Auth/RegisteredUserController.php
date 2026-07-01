<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Rules\TurnstileValid;
use App\Services\OtpService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:patient,caregiver',
            'phone_number' => 'nullable|string|max:20',
            'cf-turnstile-response' => ['required', new TurnstileValid],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // otomatis di-hash oleh cast 'password' => 'hashed' di Model
            'role' => $request->role,
            'phone_number' => $request->phone_number,
        ]);

        // Jika mendaftar sebagai patient, otomatis buat profil patient dengan pairing_code unik
        if ($user->role === UserRole::Patient) {
            for ($i = 0; $i < 5; $i++) {
                $code = 'NS'.strtoupper(Str::random(4));
                try {
                    $user->patient()->create([
                        'pairing_code' => $code,
                        'birth_date' => now()->subYears(15)->format('Y-m-d'),
                        'weight_kg' => 50.0,
                        'height_cm' => 160.0,
                        'daily_sugar_limit_g' => config('nutrisync.default_daily_sugar_limit_g', 50),
                        'current_risk_status' => RiskStatus::Aman,
                    ]);
                    break;
                } catch (QueryException $e) {
                    if ($i === 4) {
                        throw $e;
                    }
                }
            }
        }

        event(new Registered($user));

        Auth::login($user);

        // Kirim email OTP untuk verifikasi
        app(OtpService::class)->generateAndSend($user, 'email_verification');

        return redirect(route('verification.notice', absolute: false));
    }
}
