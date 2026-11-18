<?php

namespace Database\Seeders;

use App\Models\LocalProduct;
use Illuminate\Database\Seeder;

class LocalProductSeeder extends Seeder
{
    /**
     * Data produk makanan & minuman lokal Indonesia untuk keperluan demo dan fallback offline.
     *
     * Sumber referensi kandungan gula: label kemasan produk, BPOM, dan data OpenFoodFacts
     * yang sudah diverifikasi manual. Nilai gula per 100g / per sajian sudah disesuaikan
     * dengan satuan gram (g) atau mililiter yang disamakan ke gram (ml ≈ g untuk minuman).
     *
     * Kategori: minuman | susu | snack | makanan_instan | suplemen
     */
    public function run(): void
    {
        $products = [

            // ── MINUMAN BOTOL / KEMASAN ─────────────────────────────────────────
            [
                'barcode' => '8996001104007',
                'product_name' => 'Teh Botol Sosro',
                'brand' => 'Sosro',
                'category' => 'minuman',
                'sugar_per_100g' => 5.3,
                'serving_size_g' => 350,
                'sugar_per_serving_g' => 18.5,
            ],
            [
                'barcode' => '8886007500019',
                'product_name' => 'Teh Pucuk Harum',
                'brand' => 'Mayora',
                'category' => 'minuman',
                'sugar_per_100g' => 4.8,
                'serving_size_g' => 350,
                'sugar_per_serving_g' => 16.8,
            ],
            [
                'barcode' => '8993033800013',
                'product_name' => 'Mizone Active Tropical Punch',
                'brand' => 'Mizone',
                'category' => 'minuman',
                'sugar_per_100g' => 5.5,
                'serving_size_g' => 500,
                'sugar_per_serving_g' => 27.5,
            ],
            [
                'barcode' => '8992388000028',
                'product_name' => 'Aqua Galon',
                'brand' => 'Aqua',
                'category' => 'minuman',
                'sugar_per_100g' => 0.0,
                'serving_size_g' => 250,
                'sugar_per_serving_g' => 0.0,
            ],
            [
                'barcode' => '8992388010140',
                'product_name' => 'Aqua Botol 600ml',
                'brand' => 'Aqua',
                'category' => 'minuman',
                'sugar_per_100g' => 0.0,
                'serving_size_g' => 600,
                'sugar_per_serving_g' => 0.0,
            ],
            [
                'barcode' => '8992388010126',
                'product_name' => 'Aqua Botol 1500ml',
                'brand' => 'Aqua',
                'category' => 'minuman',
                'sugar_per_100g' => 0.0,
                'serving_size_g' => 250,
                'sugar_per_serving_g' => 0.0,
            ],
            [
                'barcode' => '8886008101091',
                'product_name' => 'Aqua Botol 1500ml (1.5 Liter)',
                'brand' => 'Aqua / Danone',
                'category' => 'minuman',
                'sugar_per_100g' => 0.0,
                'serving_size_g' => 250,
                'sugar_per_serving_g' => 0.0,
            ],
            [
                'barcode' => '8992388010164',
                'product_name' => 'Aqua Botol 330ml',
                'brand' => 'Aqua',
                'category' => 'minuman',
                'sugar_per_100g' => 0.0,
                'serving_size_g' => 330,
                'sugar_per_serving_g' => 0.0,
            ],
            [
                'barcode' => '8996001600018',
                'product_name' => 'Le Minerale 600ml',
                'brand' => 'Mayora',
                'category' => 'minuman',
                'sugar_per_100g' => 0.0,
                'serving_size_g' => 600,
                'sugar_per_serving_g' => 0.0,
            ],
            [
                'barcode' => '8998443001013',
                'product_name' => 'Pocari Sweat',
                'brand' => 'Otsuka',
                'category' => 'minuman',
                'sugar_per_100g' => 6.2,
                'serving_size_g' => 500,
                'sugar_per_serving_g' => 31.0,
            ],
            [
                'barcode' => '8998447000027',
                'product_name' => 'Marimas Rasa Jeruk',
                'brand' => 'Marimas',
                'category' => 'minuman',
                'sugar_per_100g' => 87.0,
                'serving_size_g' => 8,
                'sugar_per_serving_g' => 7.0,
            ],
            [
                'barcode' => '8996001300210',
                'product_name' => 'Frestea Original',
                'brand' => 'Coca-Cola',
                'category' => 'minuman',
                'sugar_per_100g' => 10.3,
                'serving_size_g' => 350,
                'sugar_per_serving_g' => 36.0,
            ],
            [
                'barcode' => '8992388100013',
                'product_name' => 'Coca-Cola Kaleng 330ml',
                'brand' => 'Coca-Cola',
                'category' => 'minuman',
                'sugar_per_100g' => 10.6,
                'serving_size_g' => 330,
                'sugar_per_serving_g' => 35.0,
            ],
            [
                'barcode' => '8996001403008',
                'product_name' => 'Sprite Botol 390ml',
                'brand' => 'Coca-Cola',
                'category' => 'minuman',
                'sugar_per_100g' => 9.9,
                'serving_size_g' => 390,
                'sugar_per_serving_g' => 38.6,
            ],
            [
                'barcode' => '8999999022227',
                'product_name' => 'Nu Green Tea Less Sugar',
                'brand' => 'ABC President',
                'category' => 'minuman',
                'sugar_per_100g' => 2.4,
                'serving_size_g' => 330,
                'sugar_per_serving_g' => 8.0,
            ],

            // ── SUSU & MINUMAN BERBASIS SUSU ────────────────────────────────────
            [
                'barcode' => '8999999045011',
                'product_name' => 'Susu Ultra Milk Full Cream 250ml',
                'brand' => 'Ultra Milk',
                'category' => 'susu',
                'sugar_per_100g' => 4.8,
                'serving_size_g' => 250,
                'sugar_per_serving_g' => 12.0,
            ],
            [
                'barcode' => '8999999045028',
                'product_name' => 'Susu Ultra Milk Coklat 250ml',
                'brand' => 'Ultra Milk',
                'category' => 'susu',
                'sugar_per_100g' => 8.4,
                'serving_size_g' => 250,
                'sugar_per_serving_g' => 21.0,
            ],
            [
                'barcode' => '8886007301019',
                'product_name' => 'Indomilk Susu Cair Full Cream',
                'brand' => 'Indomilk',
                'category' => 'susu',
                'sugar_per_100g' => 4.6,
                'serving_size_g' => 200,
                'sugar_per_serving_g' => 9.2,
            ],
            [
                'barcode' => '8996010060044',
                'product_name' => 'Milo Ready to Drink 200ml',
                'brand' => 'Nestlé Milo',
                'category' => 'susu',
                'sugar_per_100g' => 11.5,
                'serving_size_g' => 200,
                'sugar_per_serving_g' => 23.0,
            ],
            [
                'barcode' => '8996001204218',
                'product_name' => 'Yakult Original',
                'brand' => 'Yakult',
                'category' => 'susu',
                'sugar_per_100g' => 16.0,
                'serving_size_g' => 65,
                'sugar_per_serving_g' => 10.4,
            ],

            // ── SNACK / JAJANAN ─────────────────────────────────────────────────
            [
                'barcode' => '8994200801000',
                'product_name' => 'Chitato Sapi Panggang',
                'brand' => 'Chitato',
                'category' => 'snack',
                'sugar_per_100g' => 3.5,
                'serving_size_g' => 68,
                'sugar_per_serving_g' => 2.4,
            ],
            [
                'barcode' => '8886001100222',
                'product_name' => 'Oreo Original',
                'brand' => 'Mondelez',
                'category' => 'snack',
                'sugar_per_100g' => 42.7,
                'serving_size_g' => 36,
                'sugar_per_serving_g' => 15.4,
            ],
            [
                'barcode' => '8994200302003',
                'product_name' => 'Beng Beng Wafer Chocolate',
                'brand' => 'Mayora',
                'category' => 'snack',
                'sugar_per_100g' => 35.0,
                'serving_size_g' => 20,
                'sugar_per_serving_g' => 7.0,
            ],
            [
                'barcode' => '8887290020088',
                'product_name' => 'Richeese Ahh Keju',
                'brand' => 'Richeese',
                'category' => 'snack',
                'sugar_per_100g' => 2.0,
                'serving_size_g' => 65,
                'sugar_per_serving_g' => 1.3,
            ],
            [
                'barcode' => '8994200103003',
                'product_name' => 'Roma Kelapa',
                'brand' => 'Mayora',
                'category' => 'snack',
                'sugar_per_100g' => 33.0,
                'serving_size_g' => 40,
                'sugar_per_serving_g' => 13.2,
            ],
            [
                'barcode' => '8992703000134',
                'product_name' => 'Gery Malkist Coklat',
                'brand' => 'Garudafood',
                'category' => 'snack',
                'sugar_per_100g' => 28.0,
                'serving_size_g' => 35,
                'sugar_per_serving_g' => 9.8,
            ],
            [
                'barcode' => '8999999651013',
                'product_name' => 'Kopiko Candy',
                'brand' => 'Mayora',
                'category' => 'snack',
                'sugar_per_100g' => 82.0,
                'serving_size_g' => 10,
                'sugar_per_serving_g' => 8.2,
            ],
            [
                'barcode' => '8994200803009',
                'product_name' => 'Pringles Original',
                'brand' => 'Kelloggs',
                'category' => 'snack',
                'sugar_per_100g' => 2.9,
                'serving_size_g' => 30,
                'sugar_per_serving_g' => 0.9,
            ],

            // ── MI INSTAN & MAKANAN INSTAN ───────────────────────────────────────
            [
                'barcode' => '8999388000156',
                'product_name' => 'Indomie Mi Goreng Original',
                'brand' => 'Indofood',
                'category' => 'makanan_instan',
                'sugar_per_100g' => 1.8,
                'serving_size_g' => 85,
                'sugar_per_serving_g' => 1.5,
            ],
            [
                'barcode' => '8886007400225',
                'product_name' => 'Mie Sedaap Goreng',
                'brand' => 'Wings Food',
                'category' => 'makanan_instan',
                'sugar_per_100g' => 2.0,
                'serving_size_g' => 88,
                'sugar_per_serving_g' => 1.8,
            ],
            [
                'barcode' => '8992017001118',
                'product_name' => 'Pop Mie Ayam',
                'brand' => 'Indofood',
                'category' => 'makanan_instan',
                'sugar_per_100g' => 3.5,
                'serving_size_g' => 75,
                'sugar_per_serving_g' => 2.6,
            ],

            // ── MINUMAN ENERGI & SUPLEMEN ────────────────────────────────────────
            [
                'barcode' => '8998443003017',
                'product_name' => 'Extra Joss Active Rasa Jeruk',
                'brand' => 'Bintang Toedjoe',
                'category' => 'suplemen',
                'sugar_per_100g' => 30.0,
                'serving_size_g' => 4.5,
                'sugar_per_serving_g' => 1.35,
            ],
            [
                'barcode' => '8993033500009',
                'product_name' => 'Hilo School Coklat',
                'brand' => 'Kalbe',
                'category' => 'suplemen',
                'sugar_per_100g' => 31.0,
                'serving_size_g' => 40,
                'sugar_per_serving_g' => 12.4,
            ],
            [
                'barcode' => '8886007101117',
                'product_name' => 'Kuku Bima Energi',
                'brand' => 'Wings Food',
                'category' => 'suplemen',
                'sugar_per_100g' => 45.0,
                'serving_size_g' => 5,
                'sugar_per_serving_g' => 2.25,
            ],

            // ── KOPI & MINUMAN CAMPURAN ─────────────────────────────────────────
            [
                'barcode' => '8996001502213',
                'product_name' => 'Good Day Cappuccino',
                'brand' => 'Santos Jaya',
                'category' => 'minuman',
                'sugar_per_100g' => 62.0,
                'serving_size_g' => 25,
                'sugar_per_serving_g' => 15.5,
            ],
            [
                'barcode' => '8998443004021',
                'product_name' => 'Torabika Cappuccino',
                'brand' => 'Torabika',
                'category' => 'minuman',
                'sugar_per_100g' => 58.0,
                'serving_size_g' => 25,
                'sugar_per_serving_g' => 14.5,
            ],
        ];

        $now = now();

        foreach ($products as &$product) {
            $product['is_demo_data'] = true;
            $product['created_at'] = $now;
            $product['updated_at'] = $now;
        }

        // Gunakan upsert agar bisa dijalankan ulang tanpa duplikat
        LocalProduct::upsert(
            $products,
            uniqueBy: ['barcode'],
            update: ['product_name', 'brand', 'category', 'sugar_per_100g', 'serving_size_g', 'sugar_per_serving_g', 'updated_at']
        );

        $this->command->info('✅ LocalProductSeeder: '.count($products).' produk demo Indonesia berhasil di-seed!');
    }
}
