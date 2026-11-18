<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardClaim;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RewardController extends Controller
{
    /**
     * Tampilkan katalog reward dan riwayat klaim pasien.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $patient = $user->patient;

        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        $rewards = Reward::where('is_active', true)
            ->orderBy('points_required', 'asc')
            ->get();

        $myClaims = $patient->rewardClaims()
            ->with('reward')
            ->orderByDesc('claimed_at')
            ->get();

        $points = $patient->nutri_points ?? 0;
        $level = max(1, (int) floor($points / 500) + 1);
        $pointsToNext = 500 - ($points % 500);

        // Misi harian berdasarkan aktivitas hari ini
        $todayBloodSugarCount = $patient->bloodSugarLogs()->whereDate('measurement_time', now()->toDateString())->count();
        $todayNutritionCount = $patient->nutritionLogs()->whereDate('scanned_at', now()->toDateString())->count();

        $missions = [
            [
                'title' => 'Catat gula darah',
                'sub' => $todayBloodSugarCount > 0 ? 'Selesai hari ini' : '1x hari ini',
                'points' => 20,
                'progress' => min(1, $todayBloodSugarCount),
                'target' => 1,
            ],
            [
                'title' => 'Pindai makanan',
                'sub' => "{$todayNutritionCount}/2x hari ini",
                'points' => 20,
                'progress' => min(2, $todayNutritionCount),
                'target' => 2,
            ],
            [
                'title' => 'Minum air putih 8 gelas',
                'sub' => '0/8 gelas',
                'points' => 15,
                'progress' => 0,
                'target' => 8,
            ],
            [
                'title' => 'Aktivitas fisik 30 menit',
                'sub' => '0/30 menit',
                'points' => 20,
                'progress' => 0,
                'target' => 30,
            ],
        ];

        return Inertia::render('Patient/Rewards/Index', [
            'nutriPoints' => $points,
            'streakCount' => $patient->streak_count ?? 0,
            'level' => $level,
            'pointsToNext' => $pointsToNext,
            'rewards' => $rewards,
            'myClaims' => $myClaims,
            'missions' => $missions,
        ]);
    }

    /**
     * Klaim reward menggunakan nutri_points.
     */
    public function claim(Request $request, Reward $reward): RedirectResponse
    {
        $user = $request->user();
        $patient = $user->patient;

        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        if (! $reward->is_active || $reward->stock <= 0) {
            return redirect()->back()->withErrors(['reward' => 'Reward ini sudah tidak tersedia atau stok habis.']);
        }

        if ($patient->nutri_points < $reward->points_required) {
            return redirect()->back()->withErrors(['reward' => 'Poin Nutri Anda tidak cukup untuk mengklaim reward ini.']);
        }

        DB::transaction(function () use ($patient, $reward) {
            // Kurangi poin pasien
            $patient->decrement('nutri_points', $reward->points_required);

            // Kurangi stok reward
            $reward->decrement('stock');

            // Buat catatan klaim dengan kode voucher unik
            RewardClaim::create([
                'patient_id' => $patient->id,
                'reward_id' => $reward->id,
                'voucher_code' => 'NS-'.strtoupper(Str::random(8)),
                'claimed_at' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Selamat! Reward berhasil diklaim. Cek kode voucher Anda di bagian Riwayat Klaim.');
    }
}
