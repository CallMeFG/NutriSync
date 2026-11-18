<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            LocalProductSeeder::class,
            RewardSeeder::class,
            DemoDataSeeder::class,
            RichDemoSeeder::class,
        ]);

        // Akun default untuk Faskes Admin agar pengujian manual lebih mudah
        User::firstOrCreate(
            ['email' => 'fathur24ti@mahasiswa.pcr.ac.id'],
            [
                'name' => 'Fathur (Faskes Admin)',
                'password' => 'password123',
                'role' => UserRole::FaskesAdmin,
                'email_verified_at' => now(),
            ]
        );
    }
}
