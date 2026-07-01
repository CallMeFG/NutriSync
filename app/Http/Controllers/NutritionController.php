<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScanProductRequest;
use App\Services\AIPredictorService;
use App\Services\OpenFoodFactsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NutritionController extends Controller
{
    /**
     * Tampilkan riwayat pemindaian dan konsumsi makanan/minuman.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $patient = $user->patient;

        if (! $patient) {
            abort(403, 'Profil pasien tidak ditemukan.');
        }

        $logs = $patient->nutritionLogs()
            ->orderByDesc('scanned_at')
            ->paginate(15);

        $todaySugar = $patient->nutritionLogs()
            ->whereDate('scanned_at', now()->toDateString())
            ->sum('sugar_per_serving_g');

        return Inertia::render('Patient/Nutrition/Index', [
            'logs' => $logs,
            'todaySugar' => round($todaySugar, 2),
            'dailyLimit' => $patient->daily_sugar_limit_g,
            'currentStatus' => $patient->current_risk_status,
        ]);
    }

    /**
     * Lookup barcode gizi ke API eksternal OpenFoodFacts.
     * Diberi timeout dan fallback di service agar tidak merusak UX client.
     */
    public function lookupBarcode(Request $request, OpenFoodFactsService $offService): JsonResponse
    {
        $request->validate([
            'barcode' => ['required', 'string', 'max:50'],
        ]);

        $barcode = $request->query('barcode');
        $product = $offService->lookup($barcode);

        if (! $product) {
            return response()->json([
                'found' => false,
                'message' => 'Produk tidak ditemukan di database OpenFoodFacts. Silakan input nutrisi secara manual.',
            ]);
        }

        return response()->json([
            'found' => true,
            'product' => $product,
        ]);
    }

    /**
     * Simpan hasil pemindaian atau input manual nutrisi makanan/minuman.
     */
    public function store(ScanProductRequest $request, AIPredictorService $aiPredictorService): RedirectResponse
    {
        $patient = $request->user()->patient;
        $validated = $request->validated();

        $scannedAt = ! empty($validated['scanned_at'])
            ? Carbon::parse($validated['scanned_at'])->setTimezone('Asia/Jakarta')
            : now();

        // Evaluasi skor risiko produk (Aman/Waspada/Bahaya) sebelum disimpan
        $productStatus = $aiPredictorService->scoreProduct($patient, (float) $validated['sugar_g']);

        // Aturan wajib #7: result_status disimpan PERMANEN saat kejadian, tidak dihitung ulang saat ditampilkan
        // Aturan wajib #9: Offline sync pakai client_uuid untuk idempotency
        $log = $patient->nutritionLogs()->firstOrCreate(
            ['client_uuid' => $validated['client_uuid']],
            [
                'barcode' => $validated['barcode'] ?? null,
                'product_name' => $validated['product_name'] ?? 'Produk Hasil Pemindaian',
                'sugar_per_serving_g' => $validated['sugar_g'],
                'serving_size_g' => $validated['serving_size_g'] ?? 100,
                'result_status' => $productStatus,
                'scanned_at' => $scannedAt,
            ]
        );

        // Evaluasi akumulasi harian dan perbarui status pasien (serta kirim notifikasi jika bahaya)
        $aiPredictorService->processNewNutritionLog($patient, (float) $log->sugar_per_serving_g);

        return redirect()->back()->with('success', "Asupan nutrisi tersimpan (Skor Produk: {$productStatus->value}).");
    }

    /**
     * Endpoint untuk sinkronisasi batch data nutrisi offline dari Dexie.js (IndexedDB).
     */
    public function syncOffline(Request $request, AIPredictorService $aiPredictorService): JsonResponse
    {
        $request->validate([
            'logs' => ['required', 'array'],
            'logs.*.client_uuid' => ['required', 'uuid'],
            'logs.*.barcode' => ['nullable', 'string', 'max:50'],
            'logs.*.product_name' => ['required', 'string', 'max:255'],
            'logs.*.sugar_g' => ['required', 'numeric', 'min:0', 'max:500'],
            'logs.*.serving_size_g' => ['nullable', 'numeric', 'min:1', 'max:2000'],
            'logs.*.scanned_at' => ['required', 'date'],
        ]);

        $patient = $request->user()->patient;
        if (! $patient) {
            return response()->json(['error' => 'Profil pasien tidak ditemukan'], 403);
        }

        $syncedUuids = [];

        foreach ($request->input('logs') as $item) {
            $productStatus = $aiPredictorService->scoreProduct($patient, (float) $item['sugar_g']);

            $log = $patient->nutritionLogs()->firstOrCreate(
                ['client_uuid' => $item['client_uuid']],
                [
                    'barcode' => $item['barcode'] ?? null,
                    'product_name' => $item['product_name'],
                    'sugar_per_serving_g' => $item['sugar_g'],
                    'serving_size_g' => $item['serving_size_g'] ?? 100,
                    'result_status' => $productStatus,
                    'scanned_at' => Carbon::parse($item['scanned_at'])->setTimezone('Asia/Jakarta'),
                ]
            );

            $aiPredictorService->processNewNutritionLog($patient, (float) $log->sugar_per_serving_g);
            $syncedUuids[] = $item['client_uuid'];
        }

        return response()->json([
            'message' => 'Sinkronisasi nutrisi offline berhasil',
            'synced_uuids' => $syncedUuids,
        ]);
    }
}
