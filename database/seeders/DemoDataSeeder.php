<?php

namespace Database\Seeders;

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds for Competition Demo Showcase.
     */
    public function run(): void
    {
        // 1. Buat atau ambil User Remaja Demo
        $patientUser = User::firstOrCreate(
            ['email' => 'demo.patient@nutrisync.id'],
            [
                'name' => 'Budi Santoso (Demo Remaja)',
                'password' => 'password123', // cast 'hashed' pada model User otomatis meng-hash
                'role' => UserRole::Patient,
                'email_verified_at' => now(),
            ]
        );

        // 2. Profil Pasien Remaja
        $patient = Patient::firstOrCreate(
            ['user_id' => $patientUser->id],
            [
                'pairing_code' => 'DEMO01',
                'birth_date' => now()->subYears(16)->format('Y-m-d'),
                'weight_kg' => 64.5,
                'height_cm' => 165.0,
                'family_diabetes_history' => true,
                'daily_sugar_limit_g' => 20,
                'current_risk_status' => RiskStatus::Aman,
                'nutri_points' => 320,
                'streak_count' => 7,
            ]
        );

        // 3. Buat atau ambil Caregiver Demo
        $caregiverUser = User::firstOrCreate(
            ['email' => 'demo.caregiver@nutrisync.id'],
            [
                'name' => 'Siti Rahayu (Orang Tua Demo)',
                'password' => 'password123',
                'role' => UserRole::Caregiver,
                'email_verified_at' => now(),
            ]
        );

        // Hubungkan caregiver ke pasien via pairing code jika belum terhubung
        if (! $caregiverUser->monitoredPatients()->where('patients.id', $patient->id)->exists()) {
            $caregiverUser->monitoredPatients()->attach($patient->id, [
                'status' => 'active',
            ]);
        }

        // 4. Seeding Riwayat 14 Hari (Kurva realistis intervensi NutriSync)
        // Hari 14-8 lalu: sebelum rutin pakai fitur WOW (gula cenderung tinggi)
        // Hari 7-1 lalu: setelah mengikuti rekomendasi MET & Smart Swap (gula stabil turun)
        $historyData = [
            // Hari ke-14 lalu
            ['days_ago' => 14, 'glucose' => 128, 'sugar_g' => 38, 'product' => 'Boba Brown Sugar Jumbo', 'status' => RiskStatus::Bahaya],
            ['days_ago' => 13, 'glucose' => 118, 'sugar_g' => 32, 'product' => 'Minuman Bersoda Kaleng', 'status' => RiskStatus::Waspada],
            ['days_ago' => 12, 'glucose' => 122, 'sugar_g' => 35, 'product' => 'Kopi Susu Gula Aren', 'status' => RiskStatus::Waspada],
            ['days_ago' => 11, 'glucose' => 115, 'sugar_g' => 28, 'product' => 'Teh Manis Dalam Kemasan', 'status' => RiskStatus::Waspada],
            ['days_ago' => 10, 'glucose' => 110, 'sugar_g' => 26, 'product' => 'Donat Cokelat Lumer', 'status' => RiskStatus::Waspada],
            ['days_ago' => 9,  'glucose' => 108, 'sugar_g' => 24, 'product' => 'Yogurt Rasa Buah Manis', 'status' => RiskStatus::Waspada],
            ['days_ago' => 8,  'glucose' => 105, 'sugar_g' => 22, 'product' => 'Jus Alpukat Susu Kental', 'status' => RiskStatus::Waspada],

            // Hari ke-7 s/d sekarang (Intervensi NutriSync sukses -> Aman)
            ['days_ago' => 7,  'glucose' => 98,  'sugar_g' => 15, 'product' => 'Susu Kedelai Tanpa Gula', 'status' => RiskStatus::Aman],
            ['days_ago' => 6,  'glucose' => 94,  'sugar_g' => 12, 'product' => 'Air Kelapa Muda Asli', 'status' => RiskStatus::Aman],
            ['days_ago' => 5,  'glucose' => 92,  'sugar_g' => 10, 'product' => 'Teh Tawar Hijau Dingin', 'status' => RiskStatus::Aman],
            ['days_ago' => 4,  'glucose' => 90,  'sugar_g' => 14, 'product' => 'Smoothie Buah Naga Murni', 'status' => RiskStatus::Aman],
            ['days_ago' => 3,  'glucose' => 88,  'sugar_g' => 8,  'product' => 'Infused Water Lemon', 'status' => RiskStatus::Aman],
            ['days_ago' => 2,  'glucose' => 86,  'sugar_g' => 11, 'product' => 'Susu Oat Less Sugar', 'status' => RiskStatus::Aman],
            ['days_ago' => 1,  'glucose' => 88,  'sugar_g' => 9,  'product' => 'Teh Hijau Seduh Tanpa Gula', 'status' => RiskStatus::Aman],
        ];

        foreach ($historyData as $row) {
            $timestamp = Carbon::now('Asia/Jakarta')->subDays($row['days_ago'])->setTime(8, 30, 0);

            // Gula darah log
            $patient->bloodSugarLogs()->firstOrCreate(
                [
                    'patient_id' => $patient->id,
                    'measurement_time' => $timestamp,
                ],
                [
                    'client_uuid' => (string) Str::uuid(),
                    'glucose_level' => $row['glucose'],
                    'measurement_type' => 'puasa',
                    'notes' => "Pengukuran rutin pagi hari (H-{$row['days_ago']})",
                ]
            );

            // Nutrisi log
            $patient->nutritionLogs()->firstOrCreate(
                [
                    'patient_id' => $patient->id,
                    'scanned_at' => $timestamp->copy()->addHours(4),
                ],
                [
                    'client_uuid' => (string) Str::uuid(),
                    'barcode' => '89910000000'.str_pad((string) $row['days_ago'], 2, '0', STR_PAD_LEFT),
                    'product_name' => $row['product'],
                    'sugar_per_serving_g' => $row['sugar_g'],
                    'serving_size_g' => 250,
                    'result_status' => $row['status'],
                ]
            );
        }
    }
}
