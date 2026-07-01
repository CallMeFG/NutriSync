<?php

namespace App\Services;

use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;

class DeviceTrustService
{
    private const TRUST_DURATION_DAYS = 30;

    private const COOKIE_NAME = 'ns_device_trust';

    public function isTrusted(User $user, Request $request): bool
    {
        $token = $request->cookie(self::COOKIE_NAME);
        if (! $token) {
            return false;
        }

        $device = TrustedDevice::where('user_id', $user->id)
            ->where('trusted_until', '>', now())
            ->get()
            ->first(fn ($d) => Hash::check($token, $d->device_token_hash));

        if (! $device) {
            return false;
        }

        $device->update(['last_used_at' => now(), 'ip_address_last_seen' => $request->ip()]);

        return true;
    }

    public function trustThisDevice(User $user, Request $request): Cookie
    {
        $rawToken = Str::random(64);

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_token_hash' => Hash::make($rawToken),
            'device_label' => $this->parseDeviceLabel($request->userAgent()),
            'ip_address_last_seen' => $request->ip(),
            'trusted_until' => now()->addDays(self::TRUST_DURATION_DAYS),
            'last_used_at' => now(),
        ]);

        $isSecure = ! app()->environment('local', 'testing');

        return cookie(
            self::COOKIE_NAME,
            $rawToken,
            self::TRUST_DURATION_DAYS * 24 * 60,
            null,
            null,
            $isSecure, // Secure only in non-local environments so testing on HTTP localhost works
            true,      // httpOnly — TIDAK bisa diakses JavaScript
            false,
            'Strict'   // SameSite=Strict
        );
    }

    private function parseDeviceLabel(?string $userAgent): string
    {
        return Str::limit($userAgent ?? 'Unknown device', 60);
    }
}
