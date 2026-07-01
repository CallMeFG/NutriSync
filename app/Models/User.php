<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone_number',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // 'hashed' cast otomatis hash saat assign — JANGAN panggil Hash::make() manual bersamaan,
            // akan double-hash dan user tidak bisa login
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Mutator: normalisasi phone_number ke format E.164 tanpa tanda '+'.
     * Contoh input: '+6281234567890' atau '081234567890' → output: '6281234567890'
     */
    public function setPhoneNumberAttribute(?string $value): void
    {
        if ($value === null) {
            $this->attributes['phone_number'] = null;

            return;
        }

        // Hapus semua karakter non-digit
        $digits = preg_replace('/\D/', '', $value);

        // Ganti awalan '0' dengan '62' (kode negara Indonesia)
        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        // Hapus tanda '+' jika ada (sudah ter-strip oleh preg_replace di atas, tapi defense in depth)
        $this->attributes['phone_number'] = ltrim($digits, '+');
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /** Profil medis pasien (hanya ada jika role = patient) */
    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    /**
     * Daftar pasien yang dipantau (hanya ada jika role = caregiver).
     * Note: caregiver adalah READ-ONLY — tidak boleh jadi entitas 'patient'.
     */
    public function monitoredPatients()
    {
        return $this->belongsToMany(Patient::class, 'caregiver_patient', 'caregiver_id', 'patient_id')
            ->withPivot('status', 'paired_at')
            ->wherePivot('status', 'active');
    }
}
