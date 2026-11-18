<?php

namespace App\Http\Controllers;

use App\Models\BloodSugarLog;
use App\Models\NutritionLog;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FaskesController extends Controller
{
    /**
     * Tampilkan dashboard agregat klinis untuk Faskes Admin.
     */
    public function index(Request $request): Response
    {
        // Konsolidasi: 1 query GROUP BY menggantikan 4× COUNT terpisah (mencegah N+1 query pada skala besar)
        $riskCounts = Patient::query()
            ->selectRaw('current_risk_status, COUNT(*) as total')
            ->groupBy('current_risk_status')
            ->pluck('total', 'current_risk_status');

        $totalPatients = $riskCounts->sum();
        $bahayaCount = (int) ($riskCounts['bahaya'] ?? 0);
        $waspadaCount = (int) ($riskCounts['waspada'] ?? 0);
        $amanCount = (int) ($riskCounts['aman'] ?? 0);

        $totalScans7Days = NutritionLog::where('scanned_at', '>=', Carbon::now()->subDays(7))->count();

        // Daftar pasien risiko tinggi untuk intervensi klinis
        $highRiskPatients = Patient::with('user')
            ->where('current_risk_status', RiskStatus::Bahaya)
            ->take(10)
            ->get();

        // Riwayat pemindaian makanan terbaru di seluruh sistem
        $recentScans = NutritionLog::with('patient.user')
            ->orderByDesc('scanned_at')
            ->take(5)
            ->get();

        return Inertia::render('Faskes/Dashboard', [
            'stats' => [
                'total_patients' => $totalPatients,
                'bahaya_count' => $bahayaCount,
                'waspada_count' => $waspadaCount,
                'aman_count' => $amanCount,
                'total_scans_7_days' => $totalScans7Days,
            ],
            'highRiskPatients' => $highRiskPatients,
            'recentScans' => $recentScans,
        ]);
    }

    /**
     * Tampilkan halaman detail persebaran risiko dan filter pasien untuk intervensi klinis.
     */
    public function riskDistribution(Request $request): Response
    {
        $statusFilter = $request->query('status');

        $query = Patient::with(['user', 'bloodSugarLogs' => fn ($q) => $q->latest('measurement_time')->limit(1)]);

        if ($statusFilter && in_array($statusFilter, ['aman', 'waspada', 'bahaya'])) {
            $query->where('current_risk_status', $statusFilter);
        }

        $patients = $query->orderByDesc('current_risk_status')->paginate(15)->withQueryString();

        // Konsolidasi: 1 query GROUP BY untuk statistik distribusi (tidak bergantung pada filter)
        $riskCounts = Patient::query()
            ->selectRaw('current_risk_status, COUNT(*) as total')
            ->groupBy('current_risk_status')
            ->pluck('total', 'current_risk_status');

        $distribution = [
            'bahaya' => (int) ($riskCounts['bahaya'] ?? 0),
            'waspada' => (int) ($riskCounts['waspada'] ?? 0),
            'aman' => (int) ($riskCounts['aman'] ?? 0),
        ];

        return Inertia::render('Faskes/RiskDistribution', [
            'patients' => $patients,
            'distribution' => $distribution,
            'filters' => ['status' => $statusFilter],
        ]);
    }

    /**
     * Tampilkan halaman laporan dan ekspor data epidemiologi.
     */
    public function report(Request $request): Response
    {
        // 1 query GROUP BY untuk semua count status, reuse pattern dari index()
        $riskCounts = Patient::query()
            ->selectRaw('current_risk_status, COUNT(*) as total')
            ->groupBy('current_risk_status')
            ->pluck('total', 'current_risk_status');

        $totalPatients = (int) $riskCounts->sum();
        $bahayaCount = (int) ($riskCounts['bahaya'] ?? 0);

        $stats = [
            'total_patients' => $totalPatients,
            'total_nutrition_scans' => NutritionLog::count(),
            'total_glucose_logs' => BloodSugarLog::count(),
            'bahaya_pct' => $totalPatients > 0
                ? round(($bahayaCount / $totalPatients) * 100, 1)
                : 0,
        ];

        // Query tren temporal 6 bulan dari ai_risk_snapshots (data nyata, bukan simulasi)
        // Hasil: [{month: 'Jan 2026', bahaya: 12.5, waspada: 30.0, aman: 57.5, total: 40}, ...]
        $rawTrend = DB::table('ai_risk_snapshots')
            ->selectRaw("DATE_FORMAT(created_at, '%b %Y') as month,
                         DATE_FORMAT(created_at, '%Y-%m') as sort_key,
                         status,
                         COUNT(DISTINCT patient_id) as count")
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m'), status")
            ->orderByRaw("DATE_FORMAT(created_at, '%Y-%m') ASC")
            ->get();

        // Pivot: { '2026-01' => ['month' => 'Jan 2026', 'bahaya' => 5, 'waspada' => 12, 'aman' => 23] }
        $pivoted = [];
        foreach ($rawTrend as $row) {
            if (! isset($pivoted[$row->sort_key])) {
                $pivoted[$row->sort_key] = [
                    'month'   => $row->month,
                    'bahaya'  => 0,
                    'waspada' => 0,
                    'aman'    => 0,
                ];
            }
            $pivoted[$row->sort_key][$row->status] = (int) $row->count;
        }

        // Konversi ke persentase agar konsisten dengan format chart di Report.jsx
        $monthlyTrends = array_values(array_map(function ($m) {
            $total = $m['bahaya'] + $m['waspada'] + $m['aman'];
            if ($total === 0) {
                return array_merge($m, ['total_checked' => 0]);
            }

            return [
                'month'         => $m['month'],
                'bahaya'        => round(($m['bahaya'] / $total) * 100, 1),
                'waspada'       => round(($m['waspada'] / $total) * 100, 1),
                'aman'          => round(($m['aman'] / $total) * 100, 1),
                'total_checked' => $total,
            ];
        }, $pivoted));

        return Inertia::render('Faskes/Report', [
            'stats'         => $stats,
            'monthlyTrends' => $monthlyTrends,
        ]);
    }
}
