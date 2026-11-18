<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            // type: 'water' (minum air, satuan: gelas) | 'exercise' (olahraga, satuan: menit)
            $table->enum('type', ['water', 'exercise']);
            // value: jumlah gelas air ATAU menit olahraga
            $table->unsignedSmallInteger('value');
            $table->dateTime('logged_at')->useCurrent();
            $table->timestamps();

            // Index untuk query summary harian per pasien
            $table->index(['patient_id', 'logged_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
