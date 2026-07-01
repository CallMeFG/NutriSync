<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_risk_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['aman', 'waspada', 'bahaya']);
            $table->decimal('computed_daily_limit_g', 5, 2);
            // Snapshot variabel input saat kalkulasi — untuk audit/debug kalkulasi AI
            // Isi: age, bmi, family_history, avg_sugar_7d
            $table->json('input_variables');
            $table->timestamp('created_at')->useCurrent();
            // Tidak ada updated_at — snapshot bersifat immutable/append-only

            // Index untuk query chart tren risiko per pasien
            $table->index(['patient_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_risk_snapshots');
    }
};
