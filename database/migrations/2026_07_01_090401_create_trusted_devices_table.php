<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trusted_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_token_hash');
            $table->string('device_label')->nullable();
            $table->string('ip_address_last_seen', 45)->nullable();
            $table->timestamp('trusted_until');
            $table->timestamp('last_used_at');
            $table->timestamps();

            $table->index(['user_id', 'trusted_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trusted_devices');
    }
};
