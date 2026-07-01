<?php

namespace App\Services;

use App\Enums\RiskStatus;

class RiskThresholdService
{
    /**
     * Dapatkan seluruh konfigurasi ambang batas glukosa darah dari config.
     * Satu-satunya sumber kebenaran (Single Source of Truth).
     *
     * @return array<string, array{min: int, max: int}>
     */
    public function getGlucoseThresholds(): array
    {
        return config('nutrisync.glucose_thresholds', [
            'aman' => ['min' => 70, 'max' => 99],
            'waspada' => ['min' => 100, 'max' => 125],
            'bahaya' => ['min' => 126, 'max' => 600],
        ]);
    }

    /**
     * Evaluasi status risiko berdasarkan kadar glukosa darah puasa/sewaktu (mg/dL).
     * Rujukan: Pedoman PERKENI 2024 & ADA.
     */
    public function assessGlucoseStatus(int $glucoseLevel): RiskStatus
    {
        $thresholds = $this->getGlucoseThresholds();

        if ($glucoseLevel >= $thresholds['bahaya']['min']) {
            return RiskStatus::Bahaya;
        }

        if ($glucoseLevel >= $thresholds['waspada']['min']) {
            return RiskStatus::Waspada;
        }

        // Jika di bawah 70 mg/dL (hipoglikemia), masuk kategori Waspada karena abnormal
        if ($glucoseLevel < $thresholds['aman']['min']) {
            return RiskStatus::Waspada;
        }

        return RiskStatus::Aman;
    }

    /**
     * Dapatkan konfigurasi persentase ambang batas scoring produk gizi.
     *
     * @return array<string, int>
     */
    public function getProductScoreThresholds(): array
    {
        return config('nutrisync.product_score_thresholds', [
            'bahaya' => 80,
            'waspada' => 40,
        ]);
    }

    /**
     * Evaluasi status risiko produk makanan/minuman berdasarkan persentase
     * kontribusi gula produk terhadap batas maksimal gula harian pasien.
     */
    public function assessProductScore(float $percentageOfDailyLimit): RiskStatus
    {
        $thresholds = $this->getProductScoreThresholds();

        if ($percentageOfDailyLimit >= $thresholds['bahaya']) {
            return RiskStatus::Bahaya;
        }

        if ($percentageOfDailyLimit >= $thresholds['waspada']) {
            return RiskStatus::Waspada;
        }

        return RiskStatus::Aman;
    }
}
