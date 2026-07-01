<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TurnstileValid implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Graceful Local Testing Fallback: Jika di lokal/testing dan secret key kosong atau token placeholder
        if (app()->environment('local', 'testing')) {
            if (empty($value) || empty(config('services.turnstile.secret_key')) || $value === 'dev_placeholder_token' || $value === '1x00000000000000000000AA') {
                Log::info('[Local Dev] Turnstile verification bypassed due to empty value, empty secret key, or test token.');

                return;
            }
        }

        if (empty($value)) {
            $fail('Verifikasi keamanan gagal. Silakan coba lagi.');

            return;
        }

        try {
            $response = Http::asForm()->timeout(5)->post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                [
                    'secret' => config('services.turnstile.secret_key'),
                    'response' => $value,
                    'remoteip' => request()->ip(),
                ]
            );

            if (! $response->successful() || ! ($response->json('success') ?? false)) {
                $fail('Verifikasi keamanan gagal. Silakan coba lagi.');
            }
        } catch (ConnectionException $e) {
            Log::warning('Turnstile siteverify tidak dapat dihubungi', ['error' => $e->getMessage()]);

            // Di environment development lokal, izinkan lewat jika API Cloudflare error/offline
            if (app()->environment('local', 'testing')) {
                Log::info('[Local Dev] Allowing Turnstile despite ConnectionException.');

                return;
            }

            $fail('Layanan verifikasi keamanan sedang bermasalah. Silakan coba beberapa saat lagi.');
        }
    }
}
