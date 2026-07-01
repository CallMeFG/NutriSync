<?php

namespace App\Services;

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
        $url = "https://world.openfoodfacts.org/api/v0/product/{$barcode}.json";

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'User-Agent' => 'NutriSync/1.0 (Remaja Diabetes Prevention PWA - Indonesia)',
                ])
                ->get($url);

            if ($response->successful() && $response->json('status') == 1) {
                $product = $response->json('product');

                return $this->formatProductData($product);
            }

            Log::info("OpenFoodFacts: Barcode {$barcode} tidak ditemukan di database.");

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
