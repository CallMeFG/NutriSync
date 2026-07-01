<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutrition_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('barcode_number', 50)->nullable(); // null jika input manual (fallback saat OpenFoodFacts gagal)
            $table->string('food_name');
            $table->decimal('sugar_content_per_100g', 6, 2);
            $table->decimal('estimated_portion_g', 6, 2)->default(100);
            // result_status DISIMPAN PERMANEN pada saat scan terjadi.
            // JANGAN dihitung ulang saat tampil — daily_sugar_limit_g bisa berubah,
            // riwayat lama harus tetap mencerminkan kondisi SAAT ITU.
            $table->enum('result_status', ['aman', 'waspada', 'bahaya']);
            $table->decimal('daily_limit_contribution_pct', 5, 2); // % kontribusi ke batas harian pasien saat scan
            $table->dateTime('scanned_at');
            $table->timestamps();

            // Index komposit untuk query riwayat scan (sortir by waktu per pasien)
            $table->index(['patient_id', 'scanned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutrition_logs');
    }
};
