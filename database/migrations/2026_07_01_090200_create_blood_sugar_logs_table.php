<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blood_sugar_logs', function (Blueprint $table) {
            $table->id();
            // WAJIB: UUID di-generate di sisi frontend (crypto.randomUUID()) saat data dibuat offline.
            // Backend pakai firstOrCreate(['client_uuid' => $uuid]) — retry sync tidak duplikasi data.
            $table->uuid('client_uuid')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('glucose_level'); // mg/dL, validasi range 20-600 di Form Request
            $table->enum('context', ['puasa', 'setelah_makan', 'acak', 'sebelum_tidur']);
            $table->dateTime('measurement_time');
            $table->timestamps();

            // Index komposit untuk query trend chart (sortir by waktu per pasien)
            $table->index(['patient_id', 'measurement_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_sugar_logs');
    }
};
