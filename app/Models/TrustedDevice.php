<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustedDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_token_hash',
        'device_label',
        'ip_address_last_seen',
        'trusted_until',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'trusted_until' => 'datetime',
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
