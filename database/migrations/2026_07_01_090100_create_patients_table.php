<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Data fisik — disimpan sebagai decimal presisi, BUKAN integer
            $table->date('birth_date'); // usia TIDAK disimpan statis, dihitung via accessor Patient::age()
            $table->decimal('weight_kg', 5, 2)->default(0); // placeholder 0 saat registrasi, diisi di step profil
            $table->decimal('height_cm', 5, 2)->default(0);
            $table->boolean('family_diabetes_history')->default(false);

            // Pairing — caregiver scan kode ini untuk terhubung ke pasien
            $table->string('pairing_code', 6)->unique();

            // Gamifikasi
            $table->integer('streak_count')->default(0);
            $table->integer('nutri_points')->default(0);

            // Personalisasi AI — null = pakai default dari config/nutrisync.php
            $table->decimal('daily_sugar_limit_g', 5, 2)->nullable();
            $table->enum('current_risk_status', ['aman', 'waspada', 'bahaya'])->default('aman');
            $table->timestamp('risk_recalculated_at')->nullable();

            // SATUSEHAT — opsional/roadmap, nullable agar tidak memblokir MVP
            $table->string('satusehat_id', 100)->nullable();

            $table->timestamps();

            // Index untuk query dashboard faskes admin (agregat status populasi pasien)
            $table->index('current_risk_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
