<?php

namespace Database\Seeders;

use App\Enums\RiskStatus;
use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\Reward;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * RichDemoSeeder — Data sintetis realistis untuk demo kompetisi NutriSync.
 *
 * Menghasilkan:
 * - 50 pasien remaja (60% Aman / 30% Waspada / 10% Bahaya) + profil lengkap
 * - 3 caregiver terhubung ke pasien sample
 * - blood_sugar_logs 30 hari terakhir per 5 pasien utama
 * - nutrition_logs beragam produk Indonesia per 5 pasien utama
 * - ai_risk_snapshots 6 bulan untuk chart tren Faskes
 * - 5 rewards aktif e-wallet/voucher
 */
class RichDemoSeeder extends Seeder
{
    private array $products = [
        ['name' => 'Boba Brown Sugar Jumbo', 'sugar' => 38, 'status' => 'bahaya'],
        ['name' => 'Minuman Bersoda Kaleng 330ml', 'sugar' => 33, 'status' => 'bahaya'],
        ['name' => 'Kopi Susu Gula Aren 250ml', 'sugar' => 28, 'status' => 'waspada'],
        ['name' => 'Teh Manis Kemasan 500ml', 'sugar' => 24, 'status' => 'waspada'],
        ['name' => 'Yogurt Rasa Stroberi 120g', 'sugar' => 22, 'status' => 'waspada'],
        ['name' => 'Jus Jeruk Kemasan 200ml', 'sugar' => 18, 'status' => 'waspada'],
        ['name' => 'Susu Cokelat UHT 200ml', 'sugar' => 16, 'status' => 'waspada'],
        ['name' => 'Teh Hijau Seduh Tanpa Gula', 'sugar' => 3, 'status' => 'aman'],
        ['name' => 'Air Kelapa Muda Asli 300ml', 'sugar' => 8, 'status' => 'aman'],
        ['name' => 'Susu Kedelai Tanpa Gula 250ml', 'sugar' => 5, 'status' => 'aman'],
        ['name' => 'Infused Water Lemon & Mint', 'sugar' => 2, 'status' => 'aman'],
        ['name' => 'Smoothie Buah Naga 250ml', 'sugar' => 12, 'status' => 'aman'],
        ['name' => 'Susu Oat Less Sugar 200ml', 'sugar' => 9, 'status' => 'aman'],
        ['name' => 'Donat Gula Halus', 'sugar' => 26, 'status' => 'waspada'],
        ['name' => 'Wafer Cokelat 100g', 'sugar' => 20, 'status' => 'waspada'],
        ['name' => 'Es Krim Vanilla Cone', 'sugar' => 22, 'status' => 'waspada'],
        ['name' => 'Roti Manis Isi Selai 80g', 'sugar' => 18, 'status' => 'waspada'],
        ['name' => 'Kacang Almond Panggang 30g', 'sugar' => 4, 'status' => 'aman'],
        ['name' => 'Pisang Ambon 1 Buah', 'sugar' => 14, 'status' => 'aman'],
        ['name' => 'Apel Malang 1 Buah', 'sugar' => 10, 'status' => 'aman'],
    ];

    private array $patientNames = [
        'Andi Pratama', 'Dewi Rahayu', 'Rizki Fadillah', 'Sari Indriani', 'Bagas Nugroho',
        'Putri Aulia', 'Dimas Setiawan', 'Laras Permata', 'Fajar Hidayat', 'Nadia Kusuma',
        'Reza Firmansyah', 'Ayu Lestari', 'Bimo Saputra', 'Citra Wulandari', 'Deni Kurniawan',
        'Eka Sulistyo', 'Fani Maharani', 'Gilang Ramadhan', 'Hana Puspita', 'Irfan Maulana',
        'Jihan Ramadhani', 'Kevin Wijaya', 'Lina Agustina', 'Muhamad Rafli', 'Novita Sari',
        'Okta Pradana', 'Prita Anggraini', 'Qori Annisa', 'Rafi Zulkarnain', 'Sinta Dewi',
        'Tegar Wicaksono', 'Ulfah Handayani', 'Vino Pratama', 'Winda Safitri', 'Yusuf Hakim',
        'Yunita Cahyani', 'Zaki Fauzan', 'Abdi Santoso', 'Bella Kristiani', 'Cahya Nugraha',
        'Dika Permana', 'Elsa Fitriani', 'Fauzan Rizki', 'Gina Purnama', 'Hamid Alfarizi',
        'Ika Wahyuni', 'Joko Susanto', 'Kania Putri', 'Luthfi Ardiansyah', 'Maya Anggraeni',
    ];

    public function run(): void
    {
        $this->seedRewards();

        $patients = $this->seedPatients();

        $this->seedCaregivers($patients);

        // Log 30 hari hanya untuk 5 pasien utama (cukup untuk demo, tidak boros waktu seeding)
        foreach ($patients->take(5) as $patient) {
            $this->seedBloodSugarLogs($patient, 30);
            $this->seedNutritionLogs($patient, 30);
        }

        // Snapshots 6 bulan untuk SEMUA 50 pasien (dibutuhkan chart tren Faskes)
        foreach ($patients as $patient) {
            $this->seedAiRiskSnapshots($patient, 6);
        }

        $this->command->info('✅ RichDemoSeeder: 50 pasien, 30-hari logs (5 pasien utama), 6-bulan tren (50 pasien).');
    }

    private function seedRewards(): void
    {
        $rewards = [
            ['title' => 'Voucher GoPay Rp 10.000', 'description' => 'Tukar NutriPoints dengan saldo GoPay langsung ke dompet digitalmu.', 'points_required' => 500, 'stock' => 50],
            ['title' => 'Voucher OVO Rp 10.000', 'description' => 'Saldo OVO senilai Rp 10.000 untuk belanja kebutuhanmu.', 'points_required' => 500, 'stock' => 50],
            ['title' => 'Voucher Dana Rp 15.000', 'description' => 'Isi saldo DANA dan nikmati kemudahan transaksi digital.', 'points_required' => 750, 'stock' => 30],
            ['title' => 'Voucher Alfamart Rp 20.000', 'description' => 'Belanja produk sehat di Alfamart terdekat dengan kupon ini.', 'points_required' => 1000, 'stock' => 20],
            ['title' => 'Voucher Indomaret Rp 20.000', 'description' => 'Kupon belanja Indomaret untuk mendukung gaya hidup sehatmu.', 'points_required' => 1000, 'stock' => 20],
        ];

        foreach ($rewards as $reward) {
            Reward::firstOrCreate(
                ['title' => $reward['title']],
                array_merge($reward, ['is_active' => true])
            );
        }
    }

    private function seedPatients(): \Illuminate\Support\Collection
    {
        $patients = collect();

        // Distribusi PERKENI realistis: 60% Aman, 30% Waspada, 10% Bahaya
        $distribution = array_merge(
            array_fill(0, 30, 'aman'),
            array_fill(0, 15, 'waspada'),
            array_fill(0, 5, 'bahaya')
        );
        shuffle($distribution);

        foreach ($this->patientNames as $index => $name) {
            $riskStatus = $distribution[$index] ?? 'aman';
            $ageYears   = rand(12, 22);
            $weightKg   = round(rand(450, 750) / 10, 1);
            $heightCm   = round(rand(1500, 1750) / 10, 1);

            $slug  = Str::slug($name, '.');
            $email = $slug . '@demo.nutrisync.id';

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'              => $name,
                    'password'          => 'password123',
                    'role'              => UserRole::Patient,
                    'email_verified_at' => now(),
                ]
            );

            $dailyLimit = match ($riskStatus) {
                'bahaya'  => rand(15, 20),
                'waspada' => rand(18, 23),
                default   => rand(22, 28),
            };

            $patient = Patient::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'pairing_code'            => strtoupper(Str::random(6)),
                    'birth_date'              => now()->subYears($ageYears)->subDays(rand(0, 364))->format('Y-m-d'),
                    'weight_kg'               => $weightKg,
                    'height_cm'               => $heightCm,
                    'family_diabetes_history' => (bool) rand(0, 1),
                    'daily_sugar_limit_g'     => $dailyLimit,
                    'current_risk_status'     => RiskStatus::from($riskStatus),
                    'nutri_points'            => match ($riskStatus) {
                        'aman'    => rand(200, 800),
                        'waspada' => rand(50, 300),
                        default   => rand(0, 100),
                    },
                    'streak_count'        => rand(0, 14),
                    'risk_recalculated_at' => now()->subDays(rand(1, 30)),
                ]
            );

            $patients->push($patient);
        }

        return $patients;
    }

    private function seedCaregivers(\Illuminate\Support\Collection $patients): void
    {
        $caregiverData = [
            ['name' => 'Siti Rahayu (Demo Ibu)', 'email' => 'demo.caregiver@nutrisync.id', 'offset' => 0],
            ['name' => 'Bapak Santoso (Demo Ayah)', 'email' => 'demo.caregiver2@nutrisync.id', 'offset' => 2],
            ['name' => 'Paman Hendra (Demo Wali)', 'email' => 'demo.caregiver3@nutrisync.id', 'offset' => 4],
        ];

        foreach ($caregiverData as $data) {
            $caregiver = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => 'password123',
                    'role'              => UserRole::Caregiver,
                    'email_verified_at' => now(),
                ]
            );

            // Setiap caregiver memantau 2 pasien berbeda
            $assignedPatients = $patients->slice($data['offset'], 2);
            foreach ($assignedPatients as $patient) {
                if (! $caregiver->monitoredPatients()->where('patients.id', $patient->id)->exists()) {
                    $caregiver->monitoredPatients()->attach($patient->id, [
                        'status'    => 'active',
                        'paired_at' => now()->subDays(rand(10, 60)),
                    ]);
                }
            }
        }
    }

    private function seedBloodSugarLogs(Patient $patient, int $days): void
    {
        $baseGlucose = match ($patient->current_risk_status->value) {
            'bahaya'  => rand(126, 155),
            'waspada' => rand(100, 125),
            default   => rand(75, 99),
        };

        for ($i = $days; $i >= 1; $i--) {
            // Tren perbaikan: 15 hari pertama lebih buruk, 15 hari terakhir membaik
            $trendOffset = $i > 15 ? rand(5, 15) : rand(-5, 0);
            $glucose     = max(65, min(185, $baseGlucose + $trendOffset + rand(-8, 8)));

            $timestamp = Carbon::now('Asia/Jakarta')
                ->subDays($i)
                ->setTime(rand(6, 9), rand(0, 59), 0);

            $patient->bloodSugarLogs()->firstOrCreate(
                ['patient_id' => $patient->id, 'measurement_time' => $timestamp],
                [
                    'client_uuid'      => (string) Str::uuid(),
                    'glucose_level'    => $glucose,
                    'measurement_type' => ($i % 4 === 0) ? 'hba1c' : (($i % 2 === 0) ? 'sewaktu' : 'puasa'),
                    'notes'            => $i % 7 === 0 ? 'Pengukuran setelah aktivitas fisik' : null,
                ]
            );
        }
    }

    private function seedNutritionLogs(Patient $patient, int $days): void
    {
        for ($i = $days; $i >= 1; $i--) {
            $scansPerDay = rand(1, 3);
            for ($scan = 0; $scan < $scansPerDay; $scan++) {
                $product = $this->products[array_rand($this->products)];

                $timestamp = Carbon::now('Asia/Jakarta')
                    ->subDays($i)
                    ->setTime(rand(7, 20), rand(0, 59), 0)
                    ->addMinutes($scan * 180);

                $patient->nutritionLogs()->firstOrCreate(
                    ['patient_id' => $patient->id, 'scanned_at' => $timestamp],
                    [
                        'client_uuid'         => (string) Str::uuid(),
                        'product_name'        => $product['name'],
                        'sugar_per_serving_g' => $product['sugar'],
                        'serving_size_g'      => rand(150, 350),
                        'result_status'       => $product['status'],
                        'barcode'             => '89' . rand(100000000, 999999999),
                    ]
                );
            }
        }
    }

    private function seedAiRiskSnapshots(Patient $patient, int $months): void
    {
        $bmi = 22.0;
        if ($patient->height_cm > 0 && $patient->weight_kg > 0) {
            $h   = $patient->height_cm / 100;
            $bmi = round($patient->weight_kg / ($h * $h), 2);
        }

        for ($m = $months; $m >= 0; $m--) {
            // Tren realistis: makin mendekati sekarang, status cenderung membaik
            $status = match (true) {
                $m >= 4  => ($patient->current_risk_status->value === 'bahaya') ? 'bahaya' : 'waspada',
                $m >= 2  => ($patient->current_risk_status->value !== 'aman') ? 'waspada' : 'aman',
                default  => $patient->current_risk_status->value,
            };

            $startOfMonth = Carbon::now()->subMonths($m)->startOfMonth();
            $endOfMonth   = Carbon::now()->subMonths($m)->endOfMonth();

            // Satu snapshot per pasien per bulan (idempotent)
            $exists = DB::table('ai_risk_snapshots')
                ->where('patient_id', $patient->id)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->exists();

            if (! $exists) {
                DB::table('ai_risk_snapshots')->insert([
                    'patient_id'             => $patient->id,
                    'status'                 => $status,
                    'computed_daily_limit_g' => rand(15, 28),
                    'input_variables'        => json_encode([
                        'age'           => $patient->age ?? 16,
                        'bmi'           => $bmi,
                        'family_history' => (bool) $patient->family_diabetes_history,
                        'avg_sugar_7d'  => rand(10, 40),
                    ]),
                    'created_at' => $startOfMonth->midDay(),
                ]);
            }
        }
    }
}
