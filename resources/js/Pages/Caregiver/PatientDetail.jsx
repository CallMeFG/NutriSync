import React, { useState } from 'react';
import CaregiverLayout from '@/Layouts/CaregiverLayout';
import { Head, Link } from '@inertiajs/react';

export default function PatientDetail({ patient, logs = { data: [], total: 0 }, nutritionLogs = [], aiSnapshots = [] }) {
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (['nutrition', 'bloodSugar', 'fullLog', 'aiSnapshots', 'weeklySummary'].includes(tab)) {
                return tab;
            }
        }
        return 'nutrition';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [filterLogType, setFilterLogType] = useState('all');

    const riskStatus = patient.current_risk_status || 'aman';

    // Warna status konsisten dengan aturan wajib frontend-ui.md
    const statusColors = {
        aman: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]', text: 'text-[#22C55E]', label: 'Aman (Terkontrol)' },
        waspada: { bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]', text: 'text-[#EAB308]', label: 'Waspada (Batas Atas)' },
        bahaya: { bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]', text: 'text-[#EF4444]', label: 'Bahaya (Tinggi)' },
    };

    const currentStatus = statusColors[riskStatus] || statusColors.aman;

    const getGlucoseBadge = (level, type) => {
        if (type === 'hba1c') {
            if (level >= 6.5) return { color: 'bg-[#EF4444] text-white border-[#B91C1C]', label: 'Bahaya (≥ 6.5%)' };
            if (level >= 5.7) return { color: 'bg-[#EAB308] text-gray-900 border-[#CA8A04]', label: 'Waspada (5.7-6.4%)' };
            return { color: 'bg-[#22C55E] text-white border-[#15803D]', label: 'Aman (< 5.7%)' };
        }
        if (level >= 126) return { color: 'bg-[#EF4444] text-white border-[#B91C1C]', label: 'Bahaya (≥ 126 mg/dL)' };
        if (level >= 100 || level < 70) return { color: 'bg-[#EAB308] text-gray-900 border-[#CA8A04]', label: 'Waspada (100-125 mg/dL)' };
        return { color: 'bg-[#22C55E] text-white border-[#15803D]', label: 'Aman (70-99 mg/dL)' };
    };

    // Kalkulasi konsumsi gula nutrisi
    const totalSugarConsumed = nutritionLogs.reduce((acc, curr) => acc + (parseFloat(curr.sugar_per_serving_g) || 0), 0);
    const dailyLimit = patient.daily_sugar_limit_g || 25;
    const sugarProgressPercent = Math.min(Math.round((totalSugarConsumed / dailyLimit) * 100), 100);

    // Gabungkan Log Aktivitas Lengkap (Gula Darah + Nutrisi + AI Snapshots)
    const combinedLogs = [
        ...(logs.data || []).map((item) => ({
            type: 'blood_sugar',
            id: `bs_${item.id}`,
            timestamp: new Date(item.measurement_time),
            title: item.measurement_type === 'puasa' ? 'Pemeriksaan Gula Puasa' : item.measurement_type === 'sewaktu' ? 'Pemeriksaan Gula Sewaktu' : 'Tes HbA1c',
            value: `${item.glucose_level} ${item.measurement_type === 'hba1c' ? '%' : 'mg/dL'}`,
            status: getGlucoseBadge(item.glucose_level, item.measurement_type).label,
            statusColor: getGlucoseBadge(item.glucose_level, item.measurement_type).color,
            notes: item.notes || 'Pemeriksaan mandiri anak',
            icon: '🩸',
        })),
        ...(nutritionLogs || []).map((item) => ({
            type: 'nutrition',
            id: `nut_${item.id}`,
            timestamp: new Date(item.scanned_at),
            title: `Scan Barcode: ${item.product_name}`,
            value: `${item.sugar_per_serving_g}g Gula / saji`,
            status: item.result_status.toUpperCase(),
            statusColor: item.result_status === 'bahaya' ? 'bg-[#EF4444] text-white border-[#B91C1C]' : item.result_status === 'waspada' ? 'bg-[#EAB308] text-gray-900 border-[#CA8A04]' : 'bg-[#22C55E] text-white border-[#15803D]',
            notes: `Takaran saji ${item.serving_size_g}g`,
            icon: '🍎',
        })),
        ...(aiSnapshots || []).map((item, idx) => ({
            type: 'ai',
            id: `ai_${idx}`,
            timestamp: new Date(),
            title: 'Kalkulasi Risiko AI Multi-Variabel',
            value: `Batas Gula: ${item.computed_daily_limit_g}g / hari`,
            status: item.status?.toUpperCase() || 'EVALUASI',
            statusColor: 'bg-primary-600 text-white border-primary-700',
            notes: 'Pemutakhiran ambang batas otomatis berdasarkan profil klinis',
            icon: '🤖',
        })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    const filteredCombinedLogs = filterLogType === 'all' 
        ? combinedLogs 
        : combinedLogs.filter(l => l.type === filterLogType);

    return (
        <CaregiverLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-800 font-black flex items-center justify-center text-sm border border-primary-300 shadow-xs">
                            {(patient.user?.name || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-800 leading-tight">
                                Pantauan Klinis: {patient.user?.name || 'Pasien'}
                            </h2>
                            <span className="text-[10px] text-gray-400 font-medium">ID Remaja #{patient.id} • Real-time Family Sync</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={route('caregiver.patient.medical-report', patient.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                        >
                            <img src="/icons/file-icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
                            <span className="hidden sm:inline">Ekspor PDF Medis</span>
                        </a>
                        <Link
                            href={route('caregiver.dashboard')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                        >
                            <span>⬅ Kembali</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Pantauan ${patient.user?.name || 'Anak'} - Caregiver`} />

            <div className="space-y-6">
                {/* Banner Status Anak */}
                <div className={`p-5 rounded-2xl border-2 ${currentStatus.border} ${currentStatus.bg} shadow-sm relative overflow-hidden`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1 flex items-center gap-1.5">
                                <img src="/icons/pelindung.png" alt="" className="w-4 h-4 object-contain" />
                                <span>Status Evaluasi Risiko Diabetes Anak</span>
                            </div>
                            <div className={`text-2xl font-black tracking-tight ${currentStatus.text}`}>
                                {currentStatus.label}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Batas asupan gula harian rekomendasi AI: <span className="font-bold text-[#2E7D32]">{dailyLimit}g / hari</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route('caregiver.quick-message', patient.id)}
                                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
                            >
                                <img src="/icons/whatsapp-icon.png" alt="" className="w-4 h-4 object-contain brightness-200" />
                                <span>Kirim Semangat via WA</span>
                            </Link>
                            <div className="bg-white text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs border border-gray-200 flex items-center gap-1.5">
                                <span>🔒 Read-Only</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigasi Tab (sesuai 3 Page Figma + AI Snapshots) */}
                <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('nutrition')}
                        className={`py-2.5 px-3.5 font-bold text-xs rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'nutrition' ? 'bg-[#2E7D32] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>🥗 Aktivitas Gizi Anak</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'nutrition' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {nutritionLogs.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('bloodSugar')}
                        className={`py-2.5 px-3.5 font-bold text-xs rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'bloodSugar' ? 'bg-[#2E7D32] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>🩸 Riwayat Gula Darah</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'bloodSugar' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {logs.total || 0}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('fullLog')}
                        className={`py-2.5 px-3.5 font-bold text-xs rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'fullLog' ? 'bg-[#2E7D32] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>📋 Log Aktivitas Lengkap</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'fullLog' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {combinedLogs.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('aiSnapshots')}
                        className={`py-2.5 px-3.5 font-bold text-xs rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'aiSnapshots' ? 'bg-[#2E7D32] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>🤖 Analisis AI Multi-Variabel</span>
                    </button>
                </div>

                {/* ── TAB 1: AKTIVITAS GIZI ANAK (Page aktivitas gizi anak.png) ── */}
                {activeTab === 'nutrition' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Kartu Budget & Dampak Glikemik */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">Konsumsi Gula Hari Ini</div>
                                        <div className="text-2xl font-black text-gray-800 mt-1">
                                            {Math.round(totalSugarConsumed * 10) / 10}g <span className="text-sm font-semibold text-gray-400">/ {dailyLimit}g batas</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100">
                                        🥗
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1.5 mt-4">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className={totalSugarConsumed > dailyLimit ? 'text-[#EF4444]' : 'text-gray-600'}>
                                            Keterpakaian: {sugarProgressPercent}%
                                        </span>
                                        <span className="text-gray-400">Target AI: {dailyLimit}g</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                totalSugarConsumed > dailyLimit
                                                    ? 'bg-[#EF4444]'
                                                    : totalSugarConsumed > dailyLimit * 0.8
                                                        ? 'bg-[#EAB308]'
                                                        : 'bg-[#22C55E]'
                                            }`}
                                            style={{ width: `${sugarProgressPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-900 to-primary-900 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between border border-emerald-700">
                                <div>
                                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-300 mb-2">
                                        <img src="/icons/bintang-biru.png" alt="" className="w-4 h-4 object-contain brightness-200" />
                                        <span>Estimasi Dampak Glikemik Anak</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-emerald-50">
                                        Berdasarkan {nutritionLogs.length} pemindaian makanan terakhir, pola konsumsi anak Anda berada dalam rentang <span className="font-bold underline">{riskStatus.toUpperCase()}</span>. Indeks glikemik rata-rata produk yang dipindai tergolong moderat.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-[11px] text-emerald-300 font-medium">NutriSync AI Evaluation</span>
                                    <Link
                                        href={route('caregiver.quick-message', patient.id)}
                                        className="text-xs font-bold text-white hover:text-emerald-200 underline flex items-center gap-1"
                                    >
                                        <span>Beri Apresiasi via WA ➔</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Daftar Produk Dipindai */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-md">🍎 Daftar Produk & Makanan Dipindai Anak</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                                    {nutritionLogs.length} Item
                                </span>
                            </div>

                            {nutritionLogs.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <div className="text-4xl mb-2">🥗</div>
                                    <p className="font-semibold text-gray-700">Belum Ada Catatan Pemindaian</p>
                                    <p className="text-xs text-gray-400 mt-1">Saat anak memindai barcode makanan ringan atau minuman, datanya akan langsung sinkron ke sini.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {nutritionLogs.map((log) => {
                                        const badgeClass = log.result_status === 'bahaya' 
                                            ? 'bg-[#EF4444] text-white border-[#B91C1C]' 
                                            : log.result_status === 'waspada' 
                                                ? 'bg-[#EAB308] text-gray-900 border-[#CA8A04]' 
                                                : 'bg-[#22C55E] text-white border-[#15803D]';

                                        return (
                                            <div key={log.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50/60 transition">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl border border-gray-200 flex-shrink-0">
                                                        📦
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-bold text-gray-800 text-sm">{log.product_name}</h4>
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${badgeClass}`}>
                                                                {log.result_status}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                                            <span>🍬 Gula: <strong className="text-gray-800">{log.sugar_per_serving_g}g</strong> / saji</span>
                                                            <span>• Takaran: {log.serving_size_g}g</span>
                                                            <span>• 📅 {new Date(log.scanned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 2: RIWAYAT GULA DARAH ANAK (Page Riwayat Gula Darah anak.png) ── */}
                {activeTab === 'bloodSugar' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Ringkasan GDS Anak */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rata-rata GDS</div>
                                <div className="text-2xl font-black text-gray-800 mt-1">
                                    {logs.data?.length > 0 
                                        ? `${Math.round(logs.data.reduce((a, b) => a + Number(b.glucose_level), 0) / logs.data.length)} mg/dL`
                                        : '- mg/dL'}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">7 Pemeriksaan Terakhir</div>
                            </div>
                            <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">GDS Tertinggi</div>
                                <div className="text-2xl font-black text-[#EF4444] mt-1">
                                    {logs.data?.length > 0 
                                        ? `${Math.max(...logs.data.map(l => Number(l.glucose_level)))} mg/dL`
                                        : '- mg/dL'}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">Batas Bahaya: ≥ 126 mg/dL</div>
                            </div>
                            <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs">
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status Pemeriksaan</div>
                                <div className="text-2xl font-black text-[#2E7D32] mt-1">
                                    {logs.total || 0} Kali
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">Tercatat di Database Medis</div>
                            </div>
                        </div>

                        {/* Daftar Riwayat Gula Darah */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-md">🩸 Daftar Pemeriksaan Gula Darah Anak</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                                    Total: {logs.total || 0} Data
                                </span>
                            </div>

                            {logs.data && logs.data.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <div className="text-4xl mb-2">🩸</div>
                                    <p className="font-semibold text-gray-700">Belum Ada Catatan Gula Darah</p>
                                    <p className="text-xs text-gray-400 mt-1">Catatan kadar gula darah yang diinput oleh anak di aplikasinya akan muncul di sini secara real-time.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {logs.data && logs.data.map((log) => {
                                        const badge = getGlucoseBadge(log.glucose_level, log.measurement_type);
                                        return (
                                            <div key={log.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50/60 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex flex-col items-center justify-center font-bold text-gray-800 border border-gray-200 shadow-xs">
                                                        <span className="text-sm font-black">{log.glucose_level}</span>
                                                        <span className="text-[9px] uppercase text-gray-400 font-semibold">
                                                            {log.measurement_type === 'hba1c' ? '%' : 'mg'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-gray-800 capitalize text-sm">
                                                                {log.measurement_type === 'puasa' ? 'Gula Darah Puasa' : log.measurement_type === 'sewaktu' ? 'Gula Darah Sewaktu' : 'Tes HbA1c'}
                                                            </span>
                                                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            📅 {new Date(log.measurement_time).toLocaleDateString('id-ID', {
                                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                            {log.notes && <span className="ml-2 italic text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">"{log.notes}"</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 3: LOG AKTIVITAS LENGKAP ANAK (Page Log Aktivitas lengkap anak.png) ── */}
                {activeTab === 'fullLog' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Filter Bar */}
                        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                <button
                                    onClick={() => setFilterLogType('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterLogType === 'all' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Semua Aktivitas ({combinedLogs.length})
                                </button>
                                <button
                                    onClick={() => setFilterLogType('blood_sugar')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterLogType === 'blood_sugar' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    🩸 Gula Darah ({logs.data?.length || 0})
                                </button>
                                <button
                                    onClick={() => setFilterLogType('nutrition')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterLogType === 'nutrition' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    🥗 Scan Nutrisi ({nutritionLogs.length})
                                </button>
                                <button
                                    onClick={() => setFilterLogType('ai')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterLogType === 'ai' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    🤖 AI Snapshots ({aiSnapshots.length})
                                </button>
                            </div>
                            <span className="text-xs text-gray-400 font-medium px-2">Urutan: Terkini ke Terlama</span>
                        </div>

                        {/* Combined Chronological Feed */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                            {filteredCombinedLogs.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <div className="text-4xl mb-2">📋</div>
                                    <p className="font-semibold text-gray-700">Tidak Ada Log Aktivitas yang Sesuai</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredCombinedLogs.map((item) => (
                                        <div key={item.id} className="p-5 flex items-start gap-4 hover:bg-gray-50/60 transition">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg border border-gray-200 flex-shrink-0 mt-0.5">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${item.statusColor}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="font-black text-gray-900 text-sm mt-0.5">
                                                    {item.value}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center justify-between flex-wrap gap-2">
                                                    <span className="italic text-gray-600">{item.notes}</span>
                                                    <span className="text-[11px] font-semibold text-gray-400">
                                                        🕒 {item.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 4: ANALISIS AI MULTI-VARIABEL ── */}
                {activeTab === 'aiSnapshots' && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-md">🤖 Riwayat Penilaian Risiko AI Multi-Variabel</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Rekam jejak evaluasi otomatis berdasarkan Indeks Massa Tubuh (BMI), glukosa terkini, dan riwayat keluarga.</p>
                        </div>

                        {aiSnapshots.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="text-4xl mb-2">🤖</div>
                                <p className="font-semibold text-gray-700">Belum Ada Kalkulasi AI Tercatat</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {aiSnapshots.map((snap, idx) => (
                                    <div key={idx} className="p-5 hover:bg-gray-50/60 transition flex justify-between items-center gap-4">
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">
                                                Ambang Batas Gula AI: <span className="text-[#2E7D32]">{snap.computed_daily_limit_g}g / hari</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Status Klinis: <strong className="uppercase text-gray-700">{snap.status}</strong>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full uppercase">
                                            Automated Snapshot
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CaregiverLayout>
    );
}
