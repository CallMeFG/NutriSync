<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBloodSugarRequest;
use App\Models\Patient;
use App\Services\AIPredictorService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BloodSugarController extends Controller
{
    /**
     * Tampilkan riwayat log gula darah pasien.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $patient = $user->patient;

        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        $logs = $patient->bloodSugarLogs()
            ->orderByDesc('measurement_time')
            ->paginate(15);

        return Inertia::render('Patient/BloodSugar/Index', [
            'logs' => $logs,
            'currentStatus' => $patient->current_risk_status,
        ]);
    }

    /**
     * Tampilkan riwayat log untuk caregiver atau faskes (dengan otorisasi IDOR).
     */
    public function show(Patient $patient): Response
    {
        // WAJIB authorize untuk mencegah IDOR (orang tua A akses data anak B)
        Gate::authorize('view', $patient);

        $logs = $patient->bloodSugarLogs()
            ->orderByDesc('measurement_time')
            ->paginate(15);

        return Inertia::render('Caregiver/PatientDetail', [
            'patient' => $patient->load('user'),
            'logs' => $logs,
        ]);
    }

    /**
     * Simpan log gula darah baru dari pasien.
     */
    public function store(StoreBloodSugarRequest $request, AIPredictorService $aiPredictorService): RedirectResponse
    {
        $patient = $request->user()->patient;

        $validated = $request->validated();
        $measurementTime = Carbon::parse($validated['measurement_time'])->setTimezone('Asia/Jakarta');

        // Aturan wajib #9: Offline sync pakai client_uuid untuk idempotency (hindari duplikasi data saat retry)
        $log = $patient->bloodSugarLogs()->firstOrCreate(
            ['client_uuid' => $validated['client_uuid']],
            [
                'glucose_level' => $validated['glucose_level'],
                'measurement_type' => $validated['measurement_type'],
                'measurement_time' => $measurementTime,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        // Evaluasi status risiko terbaru melalui service terpusat
        $aiPredictorService->processNewBloodSugarLog($patient, (int) $log->glucose_level);

        return redirect()->back()->with('success', 'Catatan gula darah berhasil disimpan.');
    }

    /**
     * Endpoint untuk sinkronisasi batch data dari IndexedDB (Dexie.js) saat offline -> online.
     */
    public function syncOffline(Request $request, AIPredictorService $aiPredictorService): JsonResponse
    {
        $request->validate([
            'logs' => ['required', 'array'],
            'logs.*.client_uuid' => ['required', 'uuid'],
            'logs.*.glucose_level' => ['required', 'integer', 'min:20', 'max:600'],
            'logs.*.measurement_type' => ['required', 'string', 'in:puasa,sewaktu,hba1c'],
            'logs.*.measurement_time' => ['required', 'date'],
            'logs.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $patient = $request->user()->patient;
        if (! $patient) {
            return response()->json(['error' => 'Profil pasien tidak ditemukan'], 403);
        }

        $syncedUuids = [];

        foreach ($request->input('logs') as $item) {
            $log = $patient->bloodSugarLogs()->firstOrCreate(
                ['client_uuid' => $item['client_uuid']],
                [
                    'glucose_level' => $item['glucose_level'],
                    'measurement_type' => $item['measurement_type'],
                    'measurement_time' => Carbon::parse($item['measurement_time'])->setTimezone('Asia/Jakarta'),
                    'notes' => $item['notes'] ?? null,
                ]
            );

            $aiPredictorService->processNewBloodSugarLog($patient, (int) $log->glucose_level);
            $syncedUuids[] = $item['client_uuid'];
        }

        return response()->json([
            'message' => 'Sinkronisasi offline berhasil',
            'synced_uuids' => $syncedUuids,
        ]);
    }
}
