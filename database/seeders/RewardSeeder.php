<?php

namespace Database\Seeders;

use App\Models\Reward;
use Illuminate\Database\Seeder;

class RewardSeeder extends Seeder
{
    /**
     * Seed katalog insentif & voucher NutriSync.
     */
    public function run(): void
    {
        $rewards = [
            [
                'title' => 'Voucher Buah Segar Rp 50.000',
                'description' => 'Potongan harga untuk pembelian buah-buahan segar di supermarket mitra NutriSync.',
                'points_required' => 50,
                'stock' => 20,
                'is_active' => true,
            ],
            [
                'title' => 'Diskon Salad Sehat 30%',
                'description' => 'Voucher diskon khusus untuk menu salad dan makanan rendah gula di restoran mitra.',
                'points_required' => 30,
                'stock' => 15,
                'is_active' => true,
            ],
            [
                'title' => 'Gratis Konsultasi Ahli Gizi Faskes',
                'description' => 'Sesi konsultasi pribadi 45 menit bersama dokter gizi klinis di fasilitas kesehatan terdekat.',
                'points_required' => 40,
                'stock' => 50,
                'is_active' => true,
            ],
            [
                'title' => 'Voucher Gym & Olahraga 1 Bulan',
                'description' => 'Akses gratis pusat kebugaran (gym) mitra selama 30 hari untuk menjaga kebugaran fisik remaja.',
                'points_required' => 100,
                'stock' => 5,
                'is_active' => true,
            ],
            [
                'title' => 'Merchandise Kaos NutriSync Exclusive',
                'description' => 'Kaos olahraga eksklusif edisi terbatas NutriSync berbahan dry-fit premium.',
                'points_required' => 150,
                'stock' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($rewards as $reward) {
            Reward::firstOrCreate(['title' => $reward['title']], $reward);
        }
    }
}
