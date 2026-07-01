<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained()->cascadeOnDelete();
            // Voucher code unik format NUTRI-XXXXXX, di-generate saat klaim
            $table->string('voucher_code', 20)->unique();
            $table->timestamp('claimed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_claims');
    }
};
