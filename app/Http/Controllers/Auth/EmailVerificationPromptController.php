<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request, OtpService $otpService): RedirectResponse|Response
    {
        $purpose = 'email_verification';

        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('dashboard', absolute: false))
                    : Inertia::render('Auth/VerifyOtp', [
                        'email' => $request->user()->email,
                        'status' => session('status'),
                        'purpose' => $purpose,
                        'nextResendAt' => $otpService->getNextResendAt($request->user(), $purpose),
                        'devOtpCode' => (config('mail.default') === 'log' || app()->environment('local', 'testing')) ? session('dev_otp_code_'.$purpose) : null,
                    ]);
    }
}
