<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ── Trusted Proxies ────────────────────────────────────────────────────
        // Wajib agar URL helper Laravel (asset(), route(), @vite) generate HTTPS
        // saat diakses melalui Cloudflare Tunnel, nginx reverse proxy, atau hosting.
        // Tanpa ini, browser akan memblokir aset dengan error "Mixed Content".
        // '*' = percayai semua proxy (aman untuk demo/staging, batasi IP di production).
        $middleware->trustProxies(at: '*');

        // Alias middleware role — wajib ada sebelum dipakai di routes/web.php
        // Cara Laravel 13: daftar di sini, bukan di Kernel.php (tidak ada di Laravel 11+)
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);

        // HandleInertiaRequests WAJIB di grup web agar shared props (auth user, flash) tersedia di React
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();

// ── E2E Playwright (opt-in) ────────────────────────────────────────────────
// Bila NUTRISYNC_E2E=1, HANYA .env.e2e yang dimuat (DB terpisah, tanpa kredensial
// asli: WhatsApp/email/Gemini/Turnstile nonaktif). Tanpa variabel ini, perilaku
// aplikasi sama persis seperti biasa (.env).
if (getenv('NUTRISYNC_E2E') === '1') {
    $app->loadEnvironmentFrom('.env.e2e');
}

return $app;
