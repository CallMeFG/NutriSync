<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\DeviceTrustService;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        $deviceTrust = app(DeviceTrustService::class);

        // Cek apakah device ini sudah dikenal (trusted)
        if (! $deviceTrust->isTrusted($user, $request)) {
            $otpService = app(OtpService::class);
            $otpService->generateAndSend($user, 'step_up_auth');

            Auth::logout();
            $request->session()->put('pending_2fa_user_id', $user->id);

            return redirect()->route('stepup.show');
        }

        // Jika device sudah trusted, perpanjang cookie
        $cookie = $deviceTrust->trustThisDevice($user, $request);

        return redirect()->intended(route('dashboard', absolute: false))->withCookie($cookie);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
