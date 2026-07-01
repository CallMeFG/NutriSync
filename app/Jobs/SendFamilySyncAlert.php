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
     */
    public function handle(WhatsAppService $whatsAppService): void
    {
        // Ambil semua caregiver aktif yang memantau pasien ini
        $caregivers = $this->patient->caregivers()->get();

        if ($caregivers->isEmpty()) {
            Log::info("SendFamilySyncAlert: Pasien ID {$this->patient->id} ({$this->patient->user->name}) tidak memiliki caregiver aktif. Notifikasi dilewati.");

            return;
        }

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
                // Throw exception agar mekanisme retry/backoff queue bekerja jika gagal kirim
                throw new \Exception("Gagal mengirim WhatsApp alert ke nomor {$caregiver->phone_number}.");
            }
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
