import React from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, Link } from '@inertiajs/react';
import GaugeSpeedometer from '@/Components/GaugeSpeedometer';

export default function HealthSummary({
    riskStatus       = 'aman',
    averageGlucose   = null,
    timeInRange      = null,
    timeInRangeCount = null,
    timeInRangeTotal = null,
    highestGlucose   = null,
    lowestGlucose    = null,
    recommendations  = [],
    dateRangeLabel   = '30 Hari Terakhir',
}) {
    const statusConfig = {
        aman:    { label: 'Aman',    sub: 'Resiko Diabetes Anda saat ini rendah.\nPertahankan gaya hidup sehat!', from: '#1B8A4E', to: '#22A05A' },
        waspada: { label: 'Waspada', sub: 'Kadar gula Anda mendekati batas.\nPerhatikan pola makan Anda!',    from: '#B45309', to: '#D97706' },
        bahaya:  { label: 'Bahaya',  sub: 'Kadar gula Anda tinggi!\nSegera konsultasi ke dokter.',          from: '#B91C1C', to: '#EF4444' },
    };
    const cfg = statusConfig[riskStatus] || statusConfig.aman;

    const defaultRecs = [
        'Pertahankan konsumsi makanan dengan indeks glikemik rendah (misal oat, buah utuh).',
        'Lakukan aktivitas fisik aerobik ringan minimal 30 menit setiap hari.',
        'Tidur cukup 7-8 jam per malam untuk menjaga sensitivitas insulin tubuh.',
    ];
    const recs = recommendations && recommendations.length > 0 ? recommendations : defaultRecs;

    return (
        <PatientLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('patient.dashboard')} className="text-gray-500 hover:text-slate-900 p-1.5 rounded-xl bg-gray-100 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">📊 Analisis & Ringkasan Klinis</h2>
                            <p className="text-xs text-gray-500">{dateRangeLabel}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Ringkasan Kesehatan — NutriSync" />

            <div className="space-y-6 pb-20">
                {/* ── Banner Risiko + Gauge (sesuai Figma) ─────────────────── */}
                <div
                    className="rounded-3xl p-5 text-white relative overflow-hidden shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
                    role="region"
                    aria-label={`Evaluasi Risiko Klinis: ${cfg.label}`}
                >
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-4 -bottom-6 w-36 h-auto opacity-20 select-none pointer-events-none" aria-hidden="true" />
                    <img src="/icons/bintang-biru.png" alt="" className="absolute right-28 top-3 w-4 h-4 opacity-50 select-none pointer-events-none" aria-hidden="true" />

                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <img src="/icons/pelindung.png" alt="" className="w-4 h-4 object-contain brightness-0 invert opacity-90" aria-hidden="true" />
                                <span className="text-xs font-semibold opacity-90">Evaluasi Risiko Klinis PERKENI</span>
                            </div>
                            <div className="text-3xl font-black tracking-tight">{cfg.label}</div>
                            <p className="text-xs opacity-90 mt-1.5 leading-relaxed max-w-[230px] whitespace-pre-line">{cfg.sub}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2 bg-black/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
                            <GaugeSpeedometer status={riskStatus} size={110} />
                        </div>
                    </div>
                </div>

                {/* ── 4 Kartu Metrik Klinis ───────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3.5" role="region" aria-label="Ringkasan Metrik Klinis Gula Darah">
                    {/* Rata-rata */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition" role="group" aria-label={`Rata-rata Glukosa: ${averageGlucose !== null ? averageGlucose : '--'} mg/dL`}>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Rata-rata Glukosa</div>
                        <div className="text-3xl font-black text-[#1E88E5]">
                            {averageGlucose !== null ? averageGlucose : '--'}
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">mg/dL</div>
                    </div>

                    {/* Waktu dalam Target (Time-in-Range) */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition" role="group" aria-label={`Waktu dalam Target: ${timeInRange !== null ? timeInRange : '--'} persen`}>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Waktu dalam Target</div>
                        <div className="text-3xl font-black text-[#22C55E]">
                            {timeInRange !== null ? `${timeInRange}%` : '--'}
                        </div>
                        <div className="text-[11px] text-gray-400 font-semibold mt-0.5">
                            {timeInRangeCount !== null ? `${timeInRangeCount} dari ${timeInRangeTotal} cek` : 'Target: 70–140 mg/dL'}
                        </div>
                    </div>

                    {/* Tertinggi */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition" role="group" aria-label={`Puncak Tertinggi: ${highestGlucose !== null ? highestGlucose : '--'} mg/dL`}>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Puncak Tertinggi</div>
                        <div className="text-3xl font-black text-[#EF4444]">
                            {highestGlucose !== null ? highestGlucose : '--'}
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">mg/dL</div>
                    </div>

                    {/* Terendah */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition" role="group" aria-label={`Titik Terendah: ${lowestGlucose !== null ? lowestGlucose : '--'} mg/dL`}>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Titik Terendah</div>
                        <div className="text-3xl font-black text-[#22C55E]">
                            {lowestGlucose !== null ? lowestGlucose : '--'}
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">mg/dL</div>
                    </div>
                </div>

                {/* ── Rekomendasi Utama Medis ──────────────────────────────── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                        <span className="text-lg">🩺</span>
                        <h3 className="font-black text-slate-900 text-sm">Anjuran Medis & Gaya Hidup Harian</h3>
                    </div>
                    <div className="space-y-3">
                        {recs.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-gray-100">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#22C55E] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                                    ✓
                                </div>
                                <span className="text-xs text-slate-700 leading-relaxed font-medium">{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Tombol Ekspor PDF Siap Cetak ─────────────────────────── */}
                <div className="pt-2">
                    <a
                        href={route('patient.medical-report')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1565C0] hover:to-[#0D47A1] active:scale-[0.98] text-white font-bold rounded-2xl py-4 shadow-lg shadow-[#1E88E5]/25 transition text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>Ekspor Laporan Medis PDF (Siap Cetak)</span>
                    </a>
                    <p className="text-center text-[11px] text-gray-400 mt-2">
                        Format resmi berstandar untuk dibawa saat konsultasi ke dokter atau Puskesmas
                    </p>
                </div>
            </div>
        </PatientLayout>
    );
}
