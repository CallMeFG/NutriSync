<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | OpenFoodFacts API
    |--------------------------------------------------------------------------
    | Open database komunitas — tidak butuh API key.
    | WAJIB set User-Agent sesuai kebijakan OpenFoodFacts.
    */
    'openfoodfacts' => [
        'base_url' => env('OFF_API_BASE_URL', 'https://world.openfoodfacts.org/api/v2'),
        'user_agent' => env('OFF_USER_AGENT', 'NutriSync/1.0 (KMIPN VIII 2026; contact: tim@nutrisync.app)'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Fonnte WhatsApp Gateway (provider MVP NutriSync)
    |--------------------------------------------------------------------------
    | Fonnte digunakan sebagai provider notifikasi WhatsApp untuk fitur Family Sync.
    | Dipilih karena tidak butuh verifikasi bisnis Meta / review template — cukup
    | scan QR code dengan nomor cadangan di fonnte.com, lalu isi FONNTE_TOKEN.
    |
    | CATATAN: Jangan expose FONNTE_TOKEN ke frontend (jangan prefix VITE_).
    | Nomor yang scan QR WAJIB nomor cadangan — bukan nomor pribadi utama.
    | Jalur migrasi ke Meta Cloud API resmi: tersedia di masa depan pasca-MVP.
    */
    'fonnte' => [
        'token' => env('FONNTE_TOKEN'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SATUSEHAT (Opsional/Roadmap — TIDAK wajib untuk MVP)
    |--------------------------------------------------------------------------
    */
    'satusehat' => [
        'client_id' => env('SATUSEHAT_CLIENT_ID'),
        'client_secret' => env('SATUSEHAT_CLIENT_SECRET'),
        'base_url' => env('SATUSEHAT_BASE_URL', 'https://api-satusehat-stg.dto.kemkes.go.id'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cloudflare Turnstile (Anti-Bot)
    |--------------------------------------------------------------------------
    */
    'turnstile' => [
        'site_key' => env('TURNSTILE_SITE_KEY'),
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
    ],

];
