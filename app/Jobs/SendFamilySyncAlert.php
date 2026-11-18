<?php

namespace App\Jobs;

use App\Models\Patient;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendFamilySyncAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah maksimal percobaan ulang (tries).
     */
    public int $tries = 3;

    /**
     * Jeda waktu sebelum retry berikutnya (backoff dalam detik).
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Patient $patient,
        public string $customMessage = ''
    ) {}

    /**
     * Execute the job.
     *
     * Mengirim notifikasi ke SEMUA caregiver terlebih dahulu, baru melaporkan kegagalan.
     * Sebelumnya: throw di tengah loop → caregiver ke-2+ bisa terlewat jika caregiver ke-1 gagal.
     * Sekarang: kumpulkan semua kegagalan → throw satu exception di akhir agar retry mechanism
     * mencoba ulang hanya untuk yang gagal tanpa mengorbankan yang lain.
     */
    public function handle(WhatsAppService $whatsAppService): void
    {
        // Ambil semua caregiver aktif yang memantau pasien ini
        $caregivers = $this->patient->caregivers()->get();

        if ($caregivers->isEmpty()) {
            Log::info("SendFamilySyncAlert: Pasien ID {$this->patient->id} ({$this->patient->user->name}) tidak memiliki caregiver aktif. Notifikasi dilewati.");

            return;
        }

        $failedNumbers = [];

        foreach ($caregivers as $caregiver) {
            if (empty($caregiver->phone_number)) {
                Log::warning("SendFamilySyncAlert: Caregiver ID {$caregiver->id} ({$caregiver->name}) tidak memiliki nomor telepon terdaftar.");

                continue;
            }

            $success = $whatsAppService->sendEmergencyAlert(
                $caregiver->phone_number,
                $this->patient->user->name,
                $this->patient->current_risk_status->value,
                $this->customMessage
            );

            if (! $success) {
                $failedNumbers[] = $caregiver->phone_number;
                Log::warning("SendFamilySyncAlert: Gagal mengirim ke {$caregiver->phone_number} (caregiver {$caregiver->name}), akan dikumpulkan untuk retry.");
            }
        }

        // Throw exception SETELAH semua caregiver dicoba — agar mekanisme retry/backoff queue bekerja
        if (! empty($failedNumbers)) {
            throw new \Exception(
                'Gagal mengirim WhatsApp alert ke '.count($failedNumbers).' nomor: '.implode(', ', $failedNumbers)
            );
        }
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("Job SendFamilySyncAlert GAGAL PERMANEN untuk pasien ID {$this->patient->id} ({$this->patient->user->name}). Error: ".$exception->getMessage());
    }
}
