<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodSugarLog extends Model
{
    protected $fillable = [
        'client_uuid',
        'patient_id',
        'glucose_level',
        'measurement_type',
        'notes',
        'measurement_time',
    ];

    protected function casts(): array
    {
        return [
            'measurement_time' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
