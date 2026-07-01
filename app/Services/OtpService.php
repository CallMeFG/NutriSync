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

        // Graceful Local Testing Fallback: Log kode mentah untuk memudahkan testing saat SMTP kosong
        if (app()->environment('local', 'testing')) {
            Log::info("[Local Dev] OTP Code for {$user->email} ({$purpose}): {$rawCode}");
        }

        try {
            Mail::to($user->email)->send(new OtpCodeMail($rawCode, self::EXPIRY_MINUTES));
        } catch (Exception $e) {
            Log::warning("Gagal mengirim email OTP ke {$user->email}: ".$e->getMessage());
            // Jika di lokal/testing, jangan gagalkan proses agar testing tetap bisa jalan via log
            if (! app()->environment('local', 'testing')) {
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

        return true;
    }
}
