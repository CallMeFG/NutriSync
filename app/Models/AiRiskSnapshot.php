<?php

namespace App\Models;

use App\Enums\RiskStatus;
use Illuminate\Database\Eloquent\Model;

class AiRiskSnapshot extends Model
{
    // Snapshot bersifat immutable/append-only — tidak ada updated_at
    public $timestamps = false;

    protected $fillable = [
        'patient_id',
        'status',
        'computed_daily_limit_g',
        'input_variables',
    ];

    protected function casts(): array
    {
        return [
            'status' => RiskStatus::class,
            'input_variables' => 'array', // JSON column: {age, bmi, family_history, avg_sugar_7d}
            'created_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
