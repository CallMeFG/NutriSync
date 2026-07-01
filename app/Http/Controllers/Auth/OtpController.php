<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\TooManyOtpRequestsException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DeviceTrustService;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function __construct(
        private OtpService $otpService,
        private DeviceTrustService $deviceTrust
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('pairing.show');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $request->user()->email,
            'status' => session('status'),
            'purpose' => 'email_verification',
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('pairing.show');
        }

        try {
            $this->otpService->generateAndSend($request->user(), 'email_verification');
        } catch (TooManyOtpRequestsException $e) {
            return back()->withErrors(['code' => $e->getMessage()]);
        }

        return back()->with('status', 'Kode verifikasi baru telah dikirim ke email Anda.');
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'digits:6']]);

        $valid = $this->otpService->verify($request->user(), 'email_verification', $request->code);

        if (! $valid) {
            return back()->withErrors(['code' => 'Kode salah atau sudah kedaluwarsa.']);
        }

        $request->user()->update(['email_verified_at' => now()]);

        // Otomatis tandai device ini sebagai trusted setelah verifikasi email sukses
        $cookie = $this->deviceTrust->trustThisDevice($request->user(), $request);

        return redirect()->route('pairing.show')->withCookie($cookie);
    }

    // ─── Step-Up Auth (Trusted Device / Device Baru) ──────────────────────────

    public function stepUpShow(Request $request): Response|RedirectResponse
    {
        $userId = $request->session()->get('pending_2fa_user_id');
        if (! $userId || ! ($user = User::find($userId))) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $user->email,
            'status' => session('status'),
            'purpose' => 'step_up_auth',
        ]);
    }

    public function stepUpSend(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('pending_2fa_user_id');
        if (! $userId || ! ($user = User::find($userId))) {
            return redirect()->route('login');
        }

        try {
            $this->otpService->generateAndSend($user, 'step_up_auth');
        } catch (TooManyOtpRequestsException $e) {
            return back()->withErrors(['code' => $e->getMessage()]);
        }

        return back()->with('status', 'Kode verifikasi baru telah dikirim ke email Anda.');
    }

    public function stepUpVerify(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'digits:6']]);

        $userId = $request->session()->get('pending_2fa_user_id');
        if (! $userId || ! ($user = User::find($userId))) {
            return redirect()->route('login');
        }

        $valid = $this->otpService->verify($user, 'step_up_auth', $request->code);

        if (! $valid) {
            return back()->withErrors(['code' => 'Kode salah atau sudah kedaluwarsa.']);
        }

        Auth::login($user);
        $request->session()->forget('pending_2fa_user_id');

        $cookie = $this->deviceTrust->trustThisDevice($user, $request);

        return redirect()->intended(route('dashboard', absolute: false))->withCookie($cookie);
    }
}
