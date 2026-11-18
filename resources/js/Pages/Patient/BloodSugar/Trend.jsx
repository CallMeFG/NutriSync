import React, { useState, useMemo } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, Link } from '@inertiajs/react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ReferenceLine, ResponsiveContainer, ReferenceArea,
} from 'recharts';

export default function BloodSugarTrend({ logs = [], aiRecommendation = 'Kadar glukosa cenderung stabil di zona aman. Pertahankan pola makan sehat rendah glikemik!' }) {
    const [period, setPeriod] = useState(7); // 7 | 14 | 30

    // Filter data berdasarkan periode
    const filteredLogs = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - period);
        return logs.filter(log => new Date(log.measurement_time) >= cutoff && log.measurement_type !== 'hba1c');
    }, [logs, period]);

    const chartData = filteredLogs.map(log => ({
        date: new Date(log.measurement_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        glucose: Number(log.glucose_level),
        type: log.measurement_type || 'Puasa',
    }));

    // Statistik ringkasan
    const glucoseValues = filteredLogs.map(l => Number(l.glucose_level));
    const avg     = glucoseValues.length ? Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length) : null;
    const highest = glucoseValues.length ? Math.max(...glucoseValues) : null;
    const lowest  = glucoseValues.length ? Math.min(...glucoseValues) : null;

    const periods = [7, 14, 30];

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
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">📈 Tren & Grafik Gula Darah</h2>
                            <p className="text-xs text-gray-500">Analisis pergerakan glukosa darahmu sesuai standar PERKENI</p>
                        </div>
                    </div>
                    <Link
                        href={route('patient.blood-sugar.index')}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-1.5"
                    >
                        <span>➕ Catat Gula</span>
                    </Link>
                </div>
            }
        >
            <Head title="Tren Gula Darah — NutriSync" />

            <div className="space-y-6 pb-20">
                {/* ── Filter Periode (pill selector sesuai Figma) ─────────── */}
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-2">Periode Tren:</span>
                    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {periods.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                                    period === p
                                        ? 'bg-[#1E88E5] text-white shadow-xs'
                                        : 'text-gray-600 hover:text-slate-900'
                                }`}
                            >
                                {p} Hari
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 3 Kartu Statistik ──────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Rata-rata</div>
                        <div className="text-2xl font-black text-[#1E88E5] mt-1">{avg ?? '--'}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">mg/dL</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Tertinggi</div>
                        <div className="text-2xl font-black text-[#EF4444] mt-1">{highest ?? '--'}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">mg/dL</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Terendah</div>
                        <div className="text-2xl font-black text-[#22C55E] mt-1">{lowest ?? '--'}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">mg/dL</div>
                    </div>
                </div>

                {/* ── Grafik Tren dengan Zona PERKENI ─────────────────────── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div>
                            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <span>📊 Kurva Pergerakan Glukosa</span>
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Shading hijau adalah zona normal/aman (&lt;100 mg/dL)</p>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 text-[#1E88E5] px-2.5 py-1 rounded-full">
                            {chartData.length} Catatan
                        </span>
                    </div>

                    {chartData.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-xs space-y-2">
                            <span className="text-3xl">🩸</span>
                            <p className="font-semibold">Belum ada catatan glukosa dalam {period} hari terakhir.</p>
                            <Link href={route('patient.blood-sugar.index')} className="text-[#22C55E] font-bold underline">Catat Sekarang →</Link>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                {/* Zona target aman (<100 puasa / <140 sewaktu) */}
                                <ReferenceArea y1={70} y2={100} fill="#22C55E" fillOpacity={0.08} />
                                <ReferenceLine y={126} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Bahaya ≥126', position: 'insideTopRight', fontSize: 9, fill: '#EF4444', fontWeight: 700 }} />
                                <ReferenceLine y={100} stroke="#EAB308" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Waspada ≥100', position: 'insideTopRight', fontSize: 9, fill: '#EAB308', fontWeight: 700 }} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[40, 'auto']} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} unit=" mg/dL" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                                    formatter={(v, name, props) => [`${v} mg/dL (${props.payload.type})`, 'Kadar Glukosa']}
                                    labelStyle={{ fontWeight: 700, color: '#1F2937' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="glucose"
                                    stroke="#1E88E5"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#1E88E5', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#1565C0', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── Label Target Normal & Pedoman PERKENI ───────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
                            <span>Target Normal (Puasa): 70–99 mg/dL</span>
                        </span>
                        <span className="text-[11px] text-gray-400 font-normal">Pedoman PERKENI 2024</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2">
                        Kadar gula puasa <b>100–125 mg/dL</b> termasuk kategori pradiabetes/waspada. Jika mencapai <b>≥126 mg/dL</b> pada minimal dua kali pemeriksaan terpisah, disarankan segera konsultasi medis.
                    </p>
                </div>

                {/* ── Card Rekomendasi AI (vektor-latar-hijau + family icon) ── */}
                <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 rounded-2xl p-4 flex items-start gap-3.5 border border-emerald-200/80 relative overflow-hidden shadow-xs">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-2 -bottom-4 w-28 opacity-25 select-none pointer-events-none" />
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-white shadow-sm border border-emerald-100 flex items-center justify-center">
                        <img src="/icons/family.png" alt="AI" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="text-xs font-black text-emerald-800 mb-0.5">✨ Analisis & Rekomendasi AI</div>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">{aiRecommendation}</p>
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
