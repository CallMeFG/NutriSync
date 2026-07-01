<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    protected $fillable = [
        'title',
        'description',
        'points_required',
        'stock',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function claims()
    {
        return $this->hasMany(RewardClaim::class);
    }
}
