<?php

namespace App\Providers;

use App\Models\Patient;
use App\Policies\PatientPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(Patient::class, PatientPolicy::class);

        // Dinamis menyesuaikan Root URL & Scheme jika diakses via proxy (Cloudflare Tunnel, ngrok, dsb)
        // Ini memastikan Ziggy (@routes) dan semua redirect selalu cocok dengan URL domain aktif saat itu.
        if (request()->header('x-forwarded-proto') === 'https' || request()->header('x-forwarded-host')) {
            $host = request()->header('x-forwarded-host') ?? request()->getHttpHost();
            $scheme = request()->header('x-forwarded-proto', 'http');
            URL::forceScheme($scheme);
            URL::forceRootUrl($scheme . '://' . $host);
        } elseif (!app()->runningInConsole() && request()->getHttpHost()) {
            URL::forceRootUrl(request()->getSchemeAndHttpHost());
        }
    }
}
