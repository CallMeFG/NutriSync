import React, { useState } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import GaugeSpeedometer from '@/Components/GaugeSpeedometer';
import MedicalTrendCharts from '@/Components/MedicalTrendCharts';

export default function PatientDashboard({
    recentBloodSugarLogs = [],
    recentNutritionLogs  = [],
    recentActivityLogs   = [],
    todayWater           = 0,
    todayExercise        = 0,
    chartBloodSugarLogs  = [],
    chartDailySugar      = [],
    latestGlucose        = null,
    streak               = 0,
    nutriPoints          = 0,
    pointsDelta          = 0,
    aiRecommendation     = 'Terus jaga pola makan sehat dan rutin berolahraga.',
}) {
    const user    = usePage().props.auth.user;
    const patient = user.patient || {};
    const riskStatus = patient.current_risk_status || 'aman';
    const [activeTab, setActiveTab] = useState('nutrition'); // 'nutrition' | 'glucose'

    // Label & warna per status — badge Aman/Waspada/Bahaya sesuai aturan wajib PERKENI
    const statusConfig = {
        aman:    { label: 'Aman',    sub: 'Resiko Diabetes Anda saat ini rendah.\nPertahankan gaya hidup sehat!', bannerFrom: '#1B8A4E', bannerTo: '#22A05A' },
        waspada: { label: 'Waspada', sub: 'Kadar gula Anda mendekati batas.\nPerhatikan pola makan Anda!',    bannerFrom: '#B45309', bannerTo: '#D97706' },
        bahaya:  { label: 'Bahaya',  sub: 'Kadar gula Anda tinggi!\nSegera konsultasi ke dokter.',          bannerFrom: '#B91C1C', bannerTo: '#EF4444' },
    };
    const cfg = statusConfig[riskStatus] || statusConfig.aman;

    // Badge gula darah terakhir
    const latestLevel = latestGlucose?.glucose_level ? Number(latestGlucose.glucose_level) : null;
    let glucoseBadge  = 'Normal';
    if (latestLevel !== null) {
        if (latestLevel >= 126) glucoseBadge = 'Tinggi';
        else if (latestLevel >= 100 || latestLevel < 70) glucoseBadge = 'Abnormal';
    }

    // Mapping untuk MedicalTrendCharts (karena komponen mengharapkan time & glucose)
    const formattedBloodSugarChart = chartBloodSugarLogs.map((item) => ({
        time: item.measurement_time ? new Date(item.measurement_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '',
        glucose: Number(item.glucose_level),
    }));

    const dailyLimit = patient.daily_sugar_limit_g || 50;

    return (
        <PatientLayout>
            <Head title="Dashboard Remaja — NutriSync" />

            <div className="space-y-5 pb-20">
                {/* ── Header Welcome Greeting & Pairing Status ─────────────── */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#1E88E5] p-0.5 shadow-sm flex-shrink-0">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-slate-800 text-lg">
                                {user.name ? user.name[0].toUpperCase() : 'R'}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black text-slate-900 tracking-tight">
                                    Halo, {user.name} 👋
                                </h1>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                    Remaja Sehat
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Pantau terus asupan gizi & gula darahmu hari ini!
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('pairing.show')}
                        className="flex-shrink-0 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                        <span>👨‍👩‍👧 Family Sync</span>
                    </Link>
                </div>

                {/* ── Banner Risiko Diabetes (sesuai Figma) ─────────────── */}
                <div
                    className="rounded-3xl p-5 text-white relative overflow-hidden shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${cfg.bannerFrom}, ${cfg.bannerTo})` }}
                >
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-4 -bottom-6 w-36 h-auto opacity-20 select-none pointer-events-none" />
                    <img src="/icons/bintang-biru.png" alt="" className="absolute right-28 top-3 w-4 h-4 opacity-50 select-none pointer-events-none" />

                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <img src="/icons/pelindung.png" alt="" className="w-4 h-4 object-contain brightness-0 invert opacity-80" />
                                <span className="text-xs font-semibold opacity-90">Status Risiko PERKENI</span>
                            </div>
                            <div className="text-3xl font-black tracking-tight">{cfg.label}</div>
                            <p className="text-xs opacity-90 mt-1.5 leading-relaxed max-w-[220px] whitespace-pre-line">{cfg.sub}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2 bg-black/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
                            <GaugeSpeedometer status={riskStatus} size={108} />
                        </div>
                    </div>
                </div>

                {/* ── Ringkasan Hari Ini ──────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-slate-900 text-base">Ringkasan Hari Ini</h2>
                        <Link href={route('patient.health-summary')} className="text-xs font-bold text-[#1E88E5] hover:underline">
                            Lihat Analitik Lengkap &gt;
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {/* Kartu Gula Darah */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center transition hover:shadow-md">
                            <img src="/icons/gula.png" alt="" className="w-8 h-8 object-contain mx-auto mb-1.5" />
                            <div className="text-[11px] text-gray-500 font-semibold">Gula Darah</div>
                            {latestLevel !== null ? (
                                <>
                                    <div className="text-xl font-black text-slate-900 mt-1 leading-tight">{latestLevel}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">mg/dL</div>
                                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#16A34A]">{glucoseBadge}</span>
                                </>
                            ) : (
                                <div className="text-sm font-bold text-gray-300 mt-2">--</div>
                            )}
                        </div>

                        {/* Kartu Streak */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center transition hover:shadow-md">
                            <img src="/icons/api-streak.png" alt="" className="w-8 h-8 object-contain mx-auto mb-1.5" />
                            <div className="text-[11px] text-gray-500 font-semibold">Streak Log</div>
                            <div className="text-xl font-black text-[#22C55E] mt-1 leading-tight">{streak}</div>
                            <div className="text-[10px] text-gray-400 font-medium">Hari Beruntun</div>
                            <div className="text-[9px] text-[#22C55E] font-bold mt-1">🔥 Aktif</div>
                        </div>

                        {/* Kartu NutriPoin */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center transition hover:shadow-md">
                            <img src="/icons/koin-emas.png" alt="" className="w-8 h-8 object-contain mx-auto mb-1.5" />
                            <div className="text-[11px] text-gray-500 font-semibold">NutriPoin</div>
                            <div className="text-xl font-black text-amber-500 mt-1 leading-tight">
                                {nutriPoints >= 1000 ? `${(nutriPoints/1000).toFixed(1).replace('.0','')}K` : nutriPoints}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">Poin Terkumpul</div>
                            <Link href={route('patient.rewards.index')} className="text-[9px] text-[#1E88E5] font-bold mt-1 block hover:underline">Tukar Poin →</Link>
                        </div>
                    </div>

                    {/* Mini Widget Hidrasi & Olahraga Hari Ini */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Link
                            href={route('patient.activity.index')}
                            className="bg-blue-50/70 hover:bg-blue-50 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between transition group"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">💧</span>
                                <div>
                                    <div className="text-[10px] font-bold text-blue-800 uppercase">Air Minum</div>
                                    <div className="text-sm font-black text-slate-900 leading-tight">
                                        {todayWater} <span className="text-xs font-normal text-gray-500">/ 8 Gelas</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-blue-600 font-bold group-hover:translate-x-0.5 transition">→</span>
                        </Link>

                        <Link
                            href={route('patient.activity.index')}
                            className="bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between transition group"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-2xl">🏃‍♂️</span>
                                <div>
                                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Olahraga</div>
                                    <div className="text-sm font-black text-slate-900 leading-tight">
                                        {todayExercise} <span className="text-xs font-normal text-gray-500">/ 30 Menit</span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-emerald-600 font-bold group-hover:translate-x-0.5 transition">→</span>
                        </Link>
                    </div>
                </div>

                {/* ── Card Rekomendasi AI (vektor-latar-hijau + family icon) ── */}
                <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 rounded-2xl p-4 flex items-start gap-3.5 border border-emerald-200/80 relative overflow-hidden shadow-xs">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-2 -bottom-4 w-28 opacity-25 select-none pointer-events-none" />
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-white shadow-sm border border-emerald-100 flex items-center justify-center">
                        <img src="/icons/family.png" alt="AI" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="text-xs font-black text-emerald-800 mb-0.5 flex items-center gap-1">
                            <span>✨ Analisis & Rekomendasi AI</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">{aiRecommendation}</p>
                    </div>
                </div>

                {/* ── Grafik Batang & Tren Gizi (MedicalTrendCharts) ──────── */}
                <div className="pt-2">
                    <MedicalTrendCharts
                        bloodSugarChartData={formattedBloodSugarChart}
                        dailySugarData={chartDailySugar}
                        dailyLimit={dailyLimit}
                    />
                </div>

                {/* ── Aktivitas & Riwayat Terbaru ─────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                        <h3 className="font-black text-slate-900 text-sm">Aktivitas Terkini</h3>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold overflow-x-auto" role="tablist" aria-label="Filter Jenis Aktivitas">
                            <button
                                role="tab"
                                aria-selected={activeTab === 'nutrition'}
                                onClick={() => setActiveTab('nutrition')}
                                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${activeTab === 'nutrition' ? 'bg-white text-[#1E88E5] shadow-xs' : 'text-gray-500'}`}
                            >
                                🥗 Makanan ({recentNutritionLogs.length})
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'glucose'}
                                onClick={() => setActiveTab('glucose')}
                                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${activeTab === 'glucose' ? 'bg-white text-[#22C55E] shadow-xs' : 'text-gray-500'}`}
                            >
                                🩸 Gula ({recentBloodSugarLogs.length})
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'activity'}
                                onClick={() => setActiveTab('activity')}
                                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${activeTab === 'activity' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500'}`}
                            >
                                🏃‍♂️ Aktivitas ({recentActivityLogs.length})
                            </button>
                        </div>
                    </div>

                    {activeTab === 'nutrition' ? (
                        recentNutritionLogs.length > 0 ? (
                            <ul className="divide-y divide-gray-100 text-xs">
                                {recentNutritionLogs.map((log, idx) => (
                                    <li key={idx} className="py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center font-bold text-base">
                                                🥗
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{log.food_name || 'Produk Makanan'}</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {log.scanned_at ? new Date(log.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''} · Gula: <span className="font-bold text-gray-600">{log.sugar_per_serving_g}g</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                            log.result_status === 'bahaya' ? 'bg-red-100 text-red-700' :
                                            log.result_status === 'waspada' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {(log.result_status || 'aman').toUpperCase()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-xs text-gray-400">
                                <p>Belum ada riwayat pemindaian makanan.</p>
                                <Link href={route('patient.nutrition.index')} className="text-[#1E88E5] font-bold mt-1 inline-block">Mulai Pindai Sekarang →</Link>
                            </div>
                        )
                    ) : activeTab === 'glucose' ? (
                        recentBloodSugarLogs.length > 0 ? (
                            <ul className="divide-y divide-gray-100 text-xs">
                                {recentBloodSugarLogs.map((log, idx) => (
                                    <li key={idx} className="py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#22C55E] flex items-center justify-center font-bold text-base">
                                                🩸
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{log.glucose_level} mg/dL</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {log.measurement_time ? new Date(log.measurement_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''} · {log.measurement_type || 'Puasa'}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                                            Tersimpan
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-xs text-gray-400">
                                <p>Belum ada pencatatan gula darah.</p>
                                <Link href={route('patient.blood-sugar.index')} className="text-[#22C55E] font-bold mt-1 inline-block">Catat Gula Darah →</Link>
                            </div>
                        )
                    ) : (
                        recentActivityLogs.length > 0 ? (
                            <ul className="divide-y divide-gray-100 text-xs">
                                {recentActivityLogs.map((log, idx) => (
                                    <li key={idx} className="py-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                                                log.type === 'water' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {log.type === 'water' ? '💧' : '🏃‍♂️'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">
                                                    {log.type === 'water' ? `Minum Air (${log.value} Gelas)` : `Olahraga (${log.value} Menit)`}
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {log.logged_at ? new Date(log.logged_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            +10 Poin
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-6 text-xs text-gray-400">
                                <p>Belum ada pencatatan aktivitas fisik & air minum.</p>
                                <Link href={route('patient.activity.index')} className="text-blue-600 font-bold mt-1 inline-block">Catat Aktivitas →</Link>
                            </div>
                        )
                    )}
                </div>

                {/* ── Thumb-Zone Action Center (Fixed / Sticky Bottom Call to Actions) ── */}
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <Link
                        href={route('patient.nutrition.index')}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] active:scale-[0.98] text-white font-bold rounded-2xl py-4 px-4 shadow-lg shadow-[#1E88E5]/25 transition text-sm"
                    >
                        <span className="text-2xl">📷</span>
                        <div className="text-left">
                            <div className="leading-tight">Pindai Makanan</div>
                            <div className="text-[10px] font-normal opacity-85">Scan barcode gizi</div>
                        </div>
                    </Link>

                    <Link
                        href={route('patient.blood-sugar.index')}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] active:scale-[0.98] text-white font-bold rounded-2xl py-4 px-4 shadow-lg shadow-[#22C55E]/25 transition text-sm"
                    >
                        <span className="text-2xl">🩸</span>
                        <div className="text-left">
                            <div className="leading-tight">Catat Gula Darah</div>
                            <div className="text-[10px] font-normal opacity-85">Input hasil cek</div>
                        </div>
                    </Link>
                </div>
            </div>
        </PatientLayout>
    );
}
