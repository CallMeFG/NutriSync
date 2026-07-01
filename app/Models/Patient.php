<?php

namespace App\Models;

use App\Enums\RiskStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'birth_date',
        'weight_kg',
        'height_cm',
        'family_diabetes_history',
        'pairing_code',
        'streak_count',
        'nutri_points',
        'daily_sugar_limit_g',
        'current_risk_status',
        'risk_recalculated_at',
        'satusehat_id',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'family_diabetes_history' => 'boolean',
            'current_risk_status' => RiskStatus::class,
            'risk_recalculated_at' => 'datetime',
        ];
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    /**
     * Usia dihitung DINAMIS dari birth_date — TIDAK disimpan sebagai kolom statis.
     * Alasan: selalu akurat tanpa cron job harian untuk update.
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => Carbon::parse($this->birth_date)->age
        );
    }

    // ─── Business Logic (simple) ──────────────────────────────────────────────

    /**
     * Cek apakah kalkulasi personalisasi risiko perlu dijalankan ulang.
     * Logika kompleks tetap di AIPredictorService — method ini hanya cek kondisi.
     */
    public function needsRiskRecalculation(): bool
    {
        if (is_null($this->risk_recalculated_at)) {
            return true; // Belum pernah dikalkulasi sama sekali
        }

        return $this->risk_recalculated_at->diffInDays(now()) >= config('nutrisync.risk_recalc_interval_days');
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bloodSugarLogs()
    {
        return $this->hasMany(BloodSugarLog::class);
    }

    public function nutritionLogs()
    {
        return $this->hasMany(NutritionLog::class);
    }

    public function riskSnapshots()
    {
        return $this->hasMany(AiRiskSnapshot::class);
    }

    /**
     * Daftar caregiver yang terhubung ke pasien ini.
     * Caregiver hanya READ-ONLY — tidak boleh menjadi entitas patient.
     */
    public function caregivers()
    {
        return $this->belongsToMany(User::class, 'caregiver_patient', 'patient_id', 'caregiver_id')
            ->withPivot('status', 'paired_at')
            ->wherePivot('status', 'active');
    }

    public function rewardClaims()
    {
        return $this->hasMany(RewardClaim::class);
    }
}
