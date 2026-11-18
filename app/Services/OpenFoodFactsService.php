<?php

namespace App\Services;

use App\Models\LocalProduct;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenFoodFactsService
{
    /**
     * Cari data nutrisi produk berdasarkan barcode/EAN dari API OpenFoodFacts.
     * WAJIB menggunakan ->timeout(5) dan try-catch eksplisit.
     * Mengembalikan null jika gagal atau timeout agar controller bisa fallback ke input manual.
     *
     * @return array{name: string, brand: ?string, sugar_per_100g: float, sugar_per_serving_g: float, serving_size_g: float, image_url: ?string}|null
     */
    public function lookup(string $barcode): ?array
    {
        // 1. Cek database lokal dulu (cache produk Indonesia + demo data)
        //    Tidak butuh koneksi internet, langsung return jika ditemukan.
        $local = LocalProduct::where('barcode', $barcode)->first();
        if ($local) {
            Log::info("OpenFoodFactsService: Barcode {$barcode} ditemukan di database lokal ({$local->product_name}).");

            return $local->toNutritionArray();
        }

        // 2. Fallback ke OpenFoodFacts API jika tidak ada di database lokal
        $url = "https://world.openfoodfacts.org/api/v0/product/{$barcode}.json";

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'User-Agent' => 'NutriSync/1.0 (Remaja Diabetes Prevention PWA - Indonesia)',
                ])
                ->get($url);

            if ($response->successful() && $response->json('status') == 1) {
                $product = $response->json('product');
                $formatted = $this->formatProductData($product);

                // Otomatis simpan ke database lokal agar pemindai selanjutnya instan (<10ms) dan offline-ready
                $this->cacheProduct(
                    $barcode,
                    $formatted['name'],
                    $formatted['sugar_per_serving_g'],
                    $formatted['serving_size_g'],
                    $formatted['brand'],
                    $formatted['image_url']
                );

                return $formatted;
            }

            Log::info("OpenFoodFacts: Barcode {$barcode} tidak ditemukan di database lokal maupun OpenFoodFacts.");

            return null;
        } catch (ConnectionException $e) {
            Log::warning("OpenFoodFacts timeout/connection error untuk barcode {$barcode}: ".$e->getMessage());

            return null;
        } catch (\Exception $e) {
            Log::error("OpenFoodFacts unexpected error untuk barcode {$barcode}: ".$e->getMessage());

            return null;
        }
    }

    /**
     * Simpan atau perbarui produk ke dalam katalog lokal (UMKM & produk kemasan).
     */
    public function cacheProduct(
        string $barcode,
        string $productName,
        float $sugarPerServingG,
        float $servingSizeG = 100.0,
        ?string $brand = null,
        ?string $imageUrl = null
    ): LocalProduct {
        $sugar100g = $servingSizeG > 0 ? round(($sugarPerServingG / $servingSizeG) * 100, 2) : $sugarPerServingG;

        return LocalProduct::updateOrCreate(
            ['barcode' => $barcode],
            [
                'product_name' => trim($productName),
                'brand' => $brand,
                'sugar_per_100g' => $sugar100g,
                'serving_size_g' => round($servingSizeG, 2),
                'sugar_per_serving_g' => round($sugarPerServingG, 2),
                'image_url' => $imageUrl,
                'is_demo_data' => false,
            ]
        );
    }

    /**
     * Format dan standar-kan data mentah dari OpenFoodFacts.
     */
    private function formatProductData(array $product): array
    {
        $name = $product['product_name_id']
            ?? $product['product_name']
            ?? $product['product_name_en']
            ?? 'Produk Tanpa Nama';

        $brand = $product['brands'] ?? null;

        $nutriments = $product['nutriments'] ?? [];
        $sugar100g = (float) ($nutriments['sugars_100g'] ?? $nutriments['sugars'] ?? 0);

        // Ekstrak serving size (contoh "250 ml" atau "20 g")
        $servingSizeRaw = $product['serving_size'] ?? '100g';
        $servingSizeGrams = $this->parseServingSizeToGrams($servingSizeRaw);

        $sugarPerServing = $nutriments['sugars_serving'] ?? null;
        if (! is_null($sugarPerServing)) {
            $sugarPerServing = (float) $sugarPerServing;
        } else {
            $sugarPerServing = ($sugar100g / 100) * $servingSizeGrams;
        }

        return [
            'name' => trim($name),
            'brand' => $brand ? trim($brand) : null,
            'sugar_per_100g' => round($sugar100g, 2),
            'sugar_per_serving_g' => round($sugarPerServing, 2),
            'serving_size_g' => round($servingSizeGrams, 2),
            'image_url' => $product['image_front_small_url'] ?? $product['image_url'] ?? null,
        ];
    }

    /**
     * Parse string serving size ke dalam gram/ml.
     */
    private function parseServingSizeToGrams(string $servingString): float
    {
        if (preg_match('/(\d+(?:\.\d+)?)\s*(g|gr|gram|ml|l)/i', $servingString, $matches)) {
            $value = (float) $matches[1];
            $unit = strtolower($matches[2]);
            if ($unit === 'l') {
                return $value * 1000;
            }

            return $value;
        }

        return 100.0; // Default fallback 100 gram
    }
}
