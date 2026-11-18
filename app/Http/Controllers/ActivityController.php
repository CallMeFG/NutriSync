<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Models\ActivityLog;
use App\Services\AIPredictorService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Tampilkan halaman pelacakan aktivitas air minum & olahraga harian.
     */
    public function index(Request $request): Response
    {
        $patient = $request->user()->patient;
        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        $today = now()->toDateString();

        $todayWater = (int) $patient->activityLogs()
            ->where('type', 'water')
            ->whereDate('logged_at', $today)
            ->sum('value');

        $todayExercise = (int) $patient->activityLogs()
            ->where('type', 'exercise')
            ->whereDate('logged_at', $today)
            ->sum('value');

        $recentLogs = $patient->activityLogs()
            ->orderByDesc('logged_at')
            ->take(20)
            ->get();

        return Inertia::render('Patient/Activity/Log', [
            'todayWater'    => $todayWater,
            'todayExercise' => $todayExercise,
            'recentLogs'    => $recentLogs,
            'streak'        => $patient->streak_count ?? 0,
            'nutriPoints'   => $patient->nutri_points ?? 0,
        ]);
    }

    /**
     * Simpan log aktivitas (air minum atau olahraga) dari pasien.
     */
    public function store(StoreActivityRequest $request, AIPredictorService $aiPredictorService): RedirectResponse
    {
        $patient = $request->user()->patient;
        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        $validated = $request->validated();

        $patient->activityLogs()->create([
            'type'      => $validated['type'],
            'value'     => (int) $validated['value'],
            'logged_at' => now(),
        ]);

        // Berikan gamification points dan cek streak harian
        $aiPredictorService->processNewActivityLog($patient);

        $label = $validated['type'] === 'water'
            ? "Air minum ({$validated['value']} gelas) berhasil dicatat!"
            : "Olahraga ({$validated['value']} menit) berhasil dicatat!";

        return redirect()->back()->with('success', $label);
    }
}
