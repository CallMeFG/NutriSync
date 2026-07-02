<?php

namespace App\Console\Commands;

use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestWhatsAppCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'nutrisync:test-wa
                            {phone : Nomor WhatsApp tujuan (misal: 081234567890)}
                            {--name=Budi Pratama : Nama pasien anak yang akan ditampilkan}
                            {--status=BAHAYA : Status risiko (AMAN, WASPADA, BAHAYA)}
                            {--message= : Pesan tambahan (optional)}';

    /**
     * The console command description.
     */
    protected $description = 'Uji coba pengiriman notifikasi darurat WhatsApp via Fonnte (Family Sync)';

    /**
     * Execute the console command.
     */
    public function handle(WhatsAppService $whatsAppService): int
    {
        $phone = $this->argument('phone');
        $name = $this->option('name');
        $status = strtoupper($this->option('status'));
        $message = $this->option('message') ?: '';

        $token = config('services.fonnte.token');

        if (empty($token)) {
            $this->error('❌ FONNTE_TOKEN belum diisi di .env!');
            $this->line('Isi FONNTE_TOKEN dengan token dari dashboard fonnte.com terlebih dahulu.');

            return Command::FAILURE;
        }

        $this->info("📲 Mengirim notifikasi tes via Fonnte ke nomor: {$phone}...");
        $this->line("   Pasien : {$name}");
        $this->line("   Status : {$status}");
        $this->newLine();

        $success = $whatsAppService->sendEmergencyAlert($phone, $name, $status, $message);

        if ($success) {
            $this->info('✅ BERHASIL: Pesan WhatsApp telah dikirim! Silakan cek HP tujuan.');

            return Command::SUCCESS;
        }

        $this->error('❌ GAGAL: Pesan tidak terkirim. Periksa storage/logs/laravel.log untuk detail error Fonnte API.');
        $this->line('   Pastikan nomor WA cadangan Anda masih terhubung (online) di dashboard fonnte.com → Device.');

        return Command::FAILURE;
    }
}
