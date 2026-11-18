<?php

namespace App\Services;

use App\Enums\RiskStatus;
use App\Models\Patient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiRecommendationService
{
    /**
     * Hasilkan narasi rekomendasi gizi personal dinamis menggunakan Gemini API (1.5 Flash).
     * Dilengkapi timeout singkat (4 detik) dan fallback deterministik agar tidak pernah memblokir alur.
     */
    public function generatePersonalizedRecommendation(Patient $patient, RiskStatus $status, int $dailyLimit): string
    {
        $apiKey = config('services.gemini.api_key');

        // Jika API key tidak ada/kosong di .env, langsung kembalikan fallback rule-based
        if (empty($apiKey)) {
            return $this->getFallbackRecommendation($status, $dailyLimit);
        }

        try {
            $patientName = $patient->user->name ?? 'Pasien';
            $age = $patient->age ?? 16;
            $statusText = strtoupper($status->value);

            // Data konteks medis ringan
            $latestGlucose = $patient->bloodSugarLogs()->latest('measurement_time')->first()?->glucose_level ?? 'Belum ada data';
            $todaySugar = round((float) $patient->nutritionLogs()->whereDate('scanned_at', now()->toDateString())->sum('sugar_per_serving_g'), 1);

            $prompt = <<<EOT
Anda adalah dokter spesialis gizi remaja Indonesia untuk aplikasi NutriSync.
Buat 2-3 kalimat anjuran gizi dan aktivitas fisik yang personal, motivatif, hangat, dan mudah dipahami untuk remaja usia {$age} tahun.

Konteks Medis:
- Nama: {$patientName}
- Status Risiko Diabetes PERKENI saat ini: {$statusText}
- Batas konsumsi gula maksimal harian: {$dailyLimit} gram/hari
- Konsumsi gula hari ini: {$todaySugar} gram
- Gula darah terakhir: {$latestGlucose} mg/dL

Aturan:
1. Jangan menyebut diri sebagai AI. Gunakan bahasa Indonesia sehari-hari yang empati dan suportif.
2. Beri saran konkret dan praktis (misal ganti boba dengan air putih, jalan kaki sore).
3. Batasi sekitar 20-35 kata. LANGSUNG BERIKAN TEKS NASIHAT AKHIR SAJA TANPA DRAFT, TANPA REVISI, DAN TANPA PENJELASAN LAIN.
EOT;

            $response = Http::timeout(4)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 800,
                ]
            ]);

            if ($response->successful()) {
                $json = $response->json();
                $parts = $json['candidates'][0]['content']['parts'] ?? [];

                // Ambil part text final (abaikan part yang merupakan thought/reasoning)
                $text = null;
                foreach ($parts as $part) {
                    if (empty($part['thought']) && !empty($part['text'])) {
                        $text = $part['text'];
                    }
                }

                if (!empty($text)) {
                    // Bersihkan dari sisa-sisa catatan reasoning jika ada
                    return trim(preg_replace('/\s+/', ' ', $text));
                }
            }

            Log::warning("Gemini API mengembalikan response non-200 atau kosong: " . $response->body());
            return $this->getFallbackRecommendation($status, $dailyLimit);

        } catch (\Exception $e) {
            Log::info("Gemini AI API timeout/exception (menggunakan fallback): " . $e->getMessage());
            return $this->getFallbackRecommendation($status, $dailyLimit);
        }
    }

    /**
     * Fallback deterministik medis yang konsisten jika Gemini API tidak tersedia/timeout.
     */
    public function getFallbackRecommendation(RiskStatus $status, int $dailyLimit): string
    {
        $statusText = strtoupper($status->value);
        return "Batas asupan gula harian Anda adalah {$dailyLimit} gram/hari. Status risiko terkini: {$statusText}. Pertahankan konsumsi air putih, hindari minuman manis kemasan, dan rutin lakukan aktivitas fisik minimal 30 menit sehari.";
    }
}
