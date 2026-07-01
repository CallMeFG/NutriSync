<?php

namespace App\Models;

use App\Enums\RiskStatus;
use Illuminate\Database\Eloquent\Model;

class NutritionLog extends Model
{
    protected $fillable = [
        'client_uuid',
        'patient_id',
        'barcode',
        'product_name',
        'sugar_per_serving_g',
        'serving_size_g',
        'result_status',
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
