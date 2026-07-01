<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;

class EmailOtp extends Model
{
    protected $fillable = [
        'user_id',
        'code_hash',
        'purpose',
        'attempts',
        'expires_at',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return ! $this->isExpired() && is_null($this->verified_at);
    }

    public function verifyCode(string $rawCode): bool
    {
        return Hash::check($rawCode, $this->code_hash);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
