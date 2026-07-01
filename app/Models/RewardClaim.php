<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardClaim extends Model
{
    protected $fillable = [
        'patient_id',
        'reward_id',
        'voucher_code',
        'claimed_at',
    ];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }
}
