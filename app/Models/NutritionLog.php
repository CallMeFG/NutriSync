<?php

namespace App\Models;

use App\Enums\RiskStatus;
use Illuminate\Database\Eloquent\Model;

class NutritionLog extends Model
{
    protected $fillable = [
        'patient_id',
        'barcode_number',
        'food_name',
        'sugar_content_per_100g',
        'estimated_portion_g',
        'result_status',
        'daily_limit_contribution_pct',
        'scanned_at',
    ];

    protected function casts(): array
    {
        return [
            // result_status di-cast ke RiskStatus enum, tapi DISIMPAN permanen saat scan —
            // JANGAN hitung ulang saat tampil riwayat lama
            'result_status' => RiskStatus::class,
            'scanned_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
