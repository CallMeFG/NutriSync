<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caregiver_patient', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('caregiver_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('paired_at')->useCurrent();
            $table->timestamps();

            // Cegah satu caregiver dipair dua kali ke pasien yang sama
            $table->unique(['patient_id', 'caregiver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caregiver_patient');
    }
};
