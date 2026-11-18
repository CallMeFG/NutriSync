<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel cache produk lokal Indonesia untuk fallback saat OpenFoodFacts tidak tersedia.
     * Data ini juga dipakai sebagai demo data saat presentasi/kompetisi agar lookup
     * barcode tidak bergantung pada koneksi internet atau ketersediaan API eksternal.
     */
    public function up(): void
    {
        Schema::create('local_products', function (Blueprint $table) {
            $table->id();
            $table->string('barcode', 50)->unique()->comment('EAN-13 / EAN-8 barcode produk');
            $table->string('product_name', 150);
            $table->string('brand', 100)->nullable();
            $table->string('category', 60)->nullable()->comment('minuman, snack, makanan_berat, susu, dll');
            $table->decimal('sugar_per_100g', 6, 2)->default(0)->comment('Kandungan gula per 100g/ml (gram)');
            $table->decimal('serving_size_g', 7, 2)->default(100)->comment('Ukuran sajian per kemasan (gram/ml)');
            $table->decimal('sugar_per_serving_g', 6, 2)->default(0)->comment('Total gula per satu sajian (gram)');
            $table->string('image_url', 300)->nullable();
            $table->boolean('is_demo_data')->default(true)->comment('true = data seeder demo, false = dari scan user');
            $table->timestamps();

            $table->index('barcode');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('local_products');
    }
};
