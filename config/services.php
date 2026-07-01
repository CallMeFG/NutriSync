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
        'key'    => env('AWS_ACCESS_KEY_ID'),
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
        'base_url'   => env('OFF_API_BASE_URL', 'https://world.openfoodfacts.org/api/v2'),
        'user_agent' => env('OFF_USER_AGENT', 'NutriSync/1.0 (KMIPN VIII 2026; contact: tim@nutrisync.app)'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Cloud API (Meta)
    |--------------------------------------------------------------------------
    | PENTING: access_token JANGAN pernah di-expose ke frontend (prefix VITE_).
    | Template emergency harus sudah disetujui Meta sebelum bisa dipakai.
    */
    'whatsapp' => [
        'phone_number_id'    => env('WHATSAPP_PHONE_NUMBER_ID'),
        'business_account_id'=> env('WHATSAPP_BUSINESS_ACCOUNT_ID'),
        'access_token'       => env('WHATSAPP_ACCESS_TOKEN'),
        'verify_token'       => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),
        'template_emergency' => env('WHATSAPP_TEMPLATE_NAME_EMERGENCY', 'nutrisync_emergency_alert'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SATUSEHAT (Opsional/Roadmap — TIDAK wajib untuk MVP)
    |--------------------------------------------------------------------------
    */
    'satusehat' => [
        'client_id'     => env('SATUSEHAT_CLIENT_ID'),
        'client_secret' => env('SATUSEHAT_CLIENT_SECRET'),
        'base_url'      => env('SATUSEHAT_BASE_URL', 'https://api-satusehat-stg.dto.kemkes.go.id'),
    ],

];
