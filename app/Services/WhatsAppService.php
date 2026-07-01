<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Kirim notifikasi darurat WhatsApp ke caregiver/orang tua.
     * WAJIB menggunakan message template yang disetujui Meta (type: template).
     *
     * @param  string  $phoneNumber  Nomor tujuan (akan dinormalisasi otomatis)
     * @param  string  $patientName  Nama pasien anak
     * @param  string  $riskStatus  Status risiko terkini (misal: BAHAYA)
     * @param  string  $customMessage  Catatan tambahan darurat
     */
    public function sendEmergencyAlert(string $phoneNumber, string $patientName, string $riskStatus, string $customMessage = ''): bool
    {
        $normalizedPhone = $this->normalizePhoneNumber($phoneNumber);

        $token = config('services.whatsapp.token');
        $phoneId = config('services.whatsapp.phone_id');
        $templateName = config('services.whatsapp.template_name', 'nutrisync_emergency_alert');

        // Jika kredensial kosong (mode development lokal), log dan skip tanpa error
        if (empty($token) || empty($phoneId) || $token === 'placeholder') {
            Log::info("WhatsAppService (DEV MODE): Simulasi kirim template '{$templateName}' ke {$normalizedPhone} | Pasien: {$patientName} | Status: {$riskStatus} | Pesan: {$customMessage}");

            return true;
        }

        $url = "https://graph.facebook.com/v19.0/{$phoneId}/messages";

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $normalizedPhone,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => 'id',
                ],
                'components' => [
                    [
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $patientName],
                            ['type' => 'text', 'text' => strtoupper($riskStatus)],
                            ['type' => 'text', 'text' => ! empty($customMessage) ? $customMessage : 'Segera periksa asupan gula dan konsultasikan ke faskes terdekat.'],
                        ],
                    ],
                ],
            ],
        ];

        try {
            $response = Http::timeout(10)
                ->withToken($token)
                ->post($url, $payload);

            if ($response->successful()) {
                Log::info("WhatsAppService: Notifikasi darurat berhasil dikirim ke {$normalizedPhone} untuk pasien {$patientName}.");

                return true;
            }

            Log::error("WhatsAppService API error [HTTP {$response->status()}]: ".$response->body());

            return false;
        } catch (ConnectionException $e) {
            Log::critical("WhatsAppService timeout/connection error saat mengirim ke {$normalizedPhone}: ".$e->getMessage());

            return false;
        } catch (\Exception $e) {
            Log::critical("WhatsAppService unexpected error saat mengirim ke {$normalizedPhone}: ".$e->getMessage());

            return false;
        }
    }

    /**
     * Normalisasi nomor telepon ke format internasional Indonesia 62xxxxxxxxxx
     * (tanpa +, tanpa awalan 0, tanpa spasi/strip).
     */
    public function normalizePhoneNumber(string $phone): string
    {
        // Hapus semua karakter non-angka
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        // Jika dimulai dengan awalan 0, ganti dengan 62
        if (str_starts_with($cleaned, '0')) {
            return '62'.substr($cleaned, 1);
        }

        // Jika langsung angka 8 (misal 8123456789), tambahkan 62 di depan
        if (str_starts_with($cleaned, '8')) {
            return '62'.$cleaned;
        }

        return $cleaned;
    }
}
