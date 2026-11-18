<?php

namespace App\Services;

use App\Exceptions\TooManyOtpRequestsException;
use App\Mail\OtpCodeMail;
use App\Models\EmailOtp;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    private const CODE_LENGTH = 6;

    private const EXPIRY_MINUTES = 10;

    private const MAX_ATTEMPTS = 5;

    private const MAX_REQUESTS_PER_HOUR = 3;

    private const RESEND_COOLDOWN_MINUTES = 1;

    /**
     * @throws TooManyOtpRequestsException
     */
    public function generateAndSend(User $user, string $purpose): void
    {
        $recentCount = EmailOtp::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentCount >= self::MAX_REQUESTS_PER_HOUR) {
            throw new TooManyOtpRequestsException(
                'Terlalu banyak permintaan kode. Coba lagi dalam 1 jam.'
            );
        }

        // Cek jeda 5 menit sebelum boleh kirim ulang
        $latestOtp = EmailOtp::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->latest()
            ->first();

        if ($latestOtp && $latestOtp->created_at->addMinutes(self::RESEND_COOLDOWN_MINUTES)->isFuture()) {
            $secondsLeft = now()->diffInSeconds($latestOtp->created_at->addMinutes(self::RESEND_COOLDOWN_MINUTES));
            $minutes = ceil($secondsLeft / 60);
            throw new TooManyOtpRequestsException(
                "Harap tunggu {$minutes} menit lagi sebelum meminta kode verifikasi baru."
            );
        }

        // Invalidate OTP lama untuk purpose yang sama (hanya boleh ada 1 kode aktif)
        EmailOtp::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->update(['expires_at' => now()]);

        $rawCode = str_pad((string) random_int(0, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);

        EmailOtp::create([
            'user_id' => $user->id,
            'code_hash' => Hash::make($rawCode),
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES),
        ]);

        // Graceful Local Testing / Log Mailer Fallback
        if (config('mail.default') === 'log') {
            Log::info("[Local Dev] OTP Code for {$user->email} ({$purpose}): {$rawCode}");
            session()->put('dev_otp_code_'.$purpose, $rawCode);
        }

        try {
            Mail::to($user->email)->send(new OtpCodeMail($rawCode, self::EXPIRY_MINUTES));
        } catch (Exception $e) {
            Log::warning("Gagal mengirim email OTP ke {$user->email}: ".$e->getMessage());
            // Jika di lokal/testing/log, jangan gagalkan proses agar testing tetap bisa jalan via log/banner
            if (! app()->environment('local', 'testing') && config('mail.default') !== 'log') {
                throw $e;
            }
        }
    }

    public function verify(User $user, string $purpose, string $rawCode): bool
    {
        $otp = EmailOtp::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (! $otp || ! $otp->isValid()) {
            return false;
        }

        if ($otp->attempts >= self::MAX_ATTEMPTS) {
            Log::warning('OTP verification blocked: max attempts exceeded', ['user_id' => $user->id]);

            return false;
        }

        $otp->increment('attempts'); // WAJIB increment SEBELUM cek hasil

        if (! $otp->verifyCode($rawCode)) {
            return false;
        }

        $otp->update(['verified_at' => now()]);
        session()->forget('dev_otp_code_'.$purpose);

        return true;
    }

    public function getNextResendAt(User $user, string $purpose): ?string
    {
        $latestOtp = EmailOtp::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->latest()
            ->first();

        if (! $latestOtp) {
            return null;
        }

        return $latestOtp->created_at->addMinutes(self::RESEND_COOLDOWN_MINUTES)->toIso8601String();
    }
}
