<?php

// config/nutrisync.php
// SUMBER TUNGGAL ambang batas medis & konfigurasi NutriSync.
// JANGAN hardcode angka 70/100/126 di tempat lain — semua baca dari sini.
// Rujukan: PERKENI 2024 & American Diabetes Association (ADA)

return [

    /*
    |--------------------------------------------------------------------------
    | Ambang Batas Gula Konsumsi Harian (Default)
    |--------------------------------------------------------------------------
    | Nilai ini dipakai SEBELUM profil remaja lengkap atau sebelum AI
    | menyelesaikan personalisasi. Rujukan: WHO untuk remaja 10-24 tahun.
    | Catatan: perlu divalidasi oleh ahli gizi (lihat checklist manual)
    */
    'default_daily_sugar_limit_g' => 25, // gram/hari

    /*
    |--------------------------------------------------------------------------
    | Interval Kalkulasi Ulang Risiko
    |--------------------------------------------------------------------------
    | Seberapa sering AIPredictorService::recalculatePersonalization() dipanggil
    | ulang secara otomatis (hari).
    */
    'risk_recalc_interval_days' => 30,

    /*
    |--------------------------------------------------------------------------
    | Ambang Batas Glukosa Darah (mg/dL)
    |--------------------------------------------------------------------------
    | Sumber: Pedoman PERKENI 2024 & ADA
    | JANGAN ubah angka ini tanpa rujukan medis baru yang valid.
    | Update di sini = otomatis berlaku di semua service yang membacanya.
    */
    'glucose_thresholds' => [
        'aman' => [
            'min' => 70,
            'max' => 99,
        ],
        'waspada' => [
            'min' => 100,
            'max' => 125,
        ],
        'bahaya' => [
            'min' => 126,
            'max' => 600, // > 600 dianggap kemungkinan salah input, lihat validasi Form Request
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Ambang Batas Scoring Produk (Persentase dari Batas Harian)
    |--------------------------------------------------------------------------
    | Dipakai di AIPredictorService::scoreProduct() untuk menentukan status
    | risiko berdasarkan kontribusi satu produk ke batas gula harian.
    */
    'product_score_thresholds' => [
        'bahaya' => 80, // >= 80% dari batas harian → Bahaya
        'waspada' => 40, // >= 40% dari batas harian → Waspada
        // < 40% → Aman
    ],

    /*
    |--------------------------------------------------------------------------
    | Validasi Range Medis (untuk referensi Form Request)
    |--------------------------------------------------------------------------
    | Nilai ini TIDAK dipakai langsung di validasi (Form Request hardcode
    | angkanya), tapi dicantumkan di sini sebagai dokumentasi sumber kebenaran.
    */
    'validation_ranges' => [
        'glucose_level' => ['min' => 20,  'max' => 600],
        'weight_kg' => ['min' => 20,  'max' => 200],
        'height_cm' => ['min' => 100, 'max' => 220],
        'age_max_years' => 30, // batasan realistis untuk remaja/young adult
    ],

];
