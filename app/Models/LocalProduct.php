<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocalProduct extends Model
{
    protected $fillable = [
        'barcode',
        'product_name',
        'brand',
        'category',
        'sugar_per_100g',
        'serving_size_g',
        'sugar_per_serving_g',
        'image_url',
        'is_demo_data',
    ];

    protected function casts(): array
    {
        return [
            'sugar_per_100g' => 'float',
            'serving_size_g' => 'float',
            'sugar_per_serving_g' => 'float',
            'is_demo_data' => 'boolean',
        ];
    }

    /**
     * Format data ke struktur yang sama dengan OpenFoodFactsService::lookup()
     * agar controller tidak perlu tahu dari mana data berasal.
     */
    public function toNutritionArray(): array
    {
        return [
            'name' => $this->product_name,
            'brand' => $this->brand,
            'sugar_per_100g' => $this->sugar_per_100g,
            'sugar_per_serving_g' => $this->sugar_per_serving_g,
            'serving_size_g' => $this->serving_size_g,
            'image_url' => $this->image_url,
        ];
    }
}
