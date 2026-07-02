<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Kirim notifikasi darurat WhatsApp ke caregiver/orang tua via Fonnte.
     *
     * Provider: Fonnte (fonnte.com) — WhatsApp Gateway non-resmi via scan QR.
     * Dipilih untuk MVP kompetisi karena tidak butuh verifikasi bisnis/review template
     * seperti WhatsApp Cloud API resmi Meta. Pesan bebas (free-form text).
     *
     * CATATAN KEAMANAN: Nomor WA yang di-scan di Fonnte WAJIB nomor cadangan, bukan
     * nomor pribadi utama — ada risiko suspend dari Meta karena sifatnya unofficial
     * automation. Batasi penggunaan hanya untuk demo/testing terbatas.
     *
     * @param  string  $phoneNumber  Nomor tujuan (dinormalisasi otomatis ke 62xxx)
     * @param  string  $patientName  Nama pasien anak
     * @param  string  $riskStatus  Status risiko terkini (aman/waspada/bahaya)
     * @param  string  $customMessage  Catatan tambahan (opsional)
     */
    public function sendEmergencyAlert(string $phoneNumber, string $patientName, string $riskStatus, string $customMessage = ''): bool
    {
        $normalizedPhone = $this->normalizePhoneNumber($phoneNumber);
        $token = config('services.fonnte.token');

        // Jika token belum diisi (mode development lokal), log dan skip tanpa error
        if (empty($token) || $token === 'placeholder') {
            Log::info(sprintf(
                'WhatsAppService [DEV MODE]: Simulasi Fonnte alert ke %s | Pasien: %s | Status: %s',
                $normalizedPhone,
                $patientName,
                strtoupper($riskStatus)
            ));

            return true;
        }

        $note = ! empty($customMessage)
            ? $customMessage
            : 'Segera periksa asupan gula anak Anda dan konsultasikan ke faskes atau dokter terdekat.';

        $message = sprintf(
            "🚨 *PERINGATAN DARURAT NutriSync*\n\n".
            "Pasien atas nama *%s* saat ini terdeteksi dalam status risiko *%s*.\n\n".
            "📋 Catatan: %s\n\n".
            '_Pesan otomatis dari sistem NutriSync. Jangan balas pesan ini._',
            $patientName,
            strtoupper($riskStatus),
            $note
        );

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => $token,
                ])
                ->asForm()
                ->post('https://api.fonnte.com/send', [
                    'target' => $normalizedPhone,
                    'message' => $message,
                    'countryCode' => '62',
                ]);

            if ($response->successful() && ($response->json('status') === true || $response->json('status') === 'true')) {
                Log::info(sprintf(
                    'WhatsAppService [Fonnte]: Notifikasi darurat berhasil dikirim ke %s untuk pasien %s.',
                    $normalizedPhone,
                    $patientName
                ));

                return true;
            }

            Log::error(sprintf(
                'WhatsAppService [Fonnte] API error [HTTP %d]: %s',
                $response->status(),
                $response->body()
            ));

            return false;
        } catch (ConnectionException $e) {
            Log::critical(sprintf(
                'WhatsAppService [Fonnte] timeout/connection error saat mengirim ke %s: %s',
                $normalizedPhone,
                $e->getMessage()
            ));

            return false;
        } catch (\Exception $e) {
            Log::critical(sprintf(
                'WhatsAppService [Fonnte] unexpected error saat mengirim ke %s: %s',
                $normalizedPhone,
                $e->getMessage()
            ));

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
