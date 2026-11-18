import React, { useState } from 'react';
import FaskesLayout from '@/Layouts/FaskesLayout';
import { Head, Link } from '@inertiajs/react';

export default function RiskDistribution({ patients = { data: [], links: [], total: 0 }, distribution = {}, filters = {} }) {
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'territory'
    const totalAll = (distribution.bahaya || 0) + (distribution.waspada || 0) + (distribution.aman || 0);

    const getStatusBadge = (status) => {
        if (status === 'bahaya') return { color: 'bg-[#EF4444] text-white border border-[#B91C1C]', label: 'Bahaya (Kritis)' };
        if (status === 'waspada') return { color: 'bg-[#EAB308] text-gray-900 border border-[#CA8A04]', label: 'Waspada' };
        return { color: 'bg-[#22C55E] text-white border border-[#15803D]', label: 'Aman (Terkontrol)' };
    };

    // Data Simulasi/Pemetaan Wilayah (Puskesmas / Sekolah Bina)
    const territories = [
        { id: 1, name: 'Wilayah Puskesmas Kebayoran Baru', schools: '4 SMAN, 6 SMPN', total_teens: 184, bahaya: 28, waspada: 56, aman: 100, status: 'bahaya', trend: 'Meningkat (+4.2%)' },
        { id: 2, name: 'Wilayah Puskesmas Tebet Barat', schools: '3 SMAN, 5 SMPN', total_teens: 142, bahaya: 12, waspada: 48, aman: 82, status: 'waspada', trend: 'Stabil (0.0%)' },
        { id: 3, name: 'Wilayah Puskesmas Setiabudi', schools: '5 SMAN, 4 SMPN', total_teens: 165, bahaya: 9, waspada: 36, aman: 120, status: 'aman', trend: 'Menurun (-2.1%)' },
        { id: 4, name: 'Wilayah Puskesmas Pasar Minggu', schools: '6 SMAN, 8 SMPN', total_teens: 210, bahaya: 34, waspada: 66, aman: 110, status: 'bahaya', trend: 'Meningkat (+5.8%)' },
        { id: 5, name: 'Wilayah Puskesmas Cilandak', schools: '3 SMAN, 4 SMPN', total_teens: 115, bahaya: 6, waspada: 24, aman: 85, status: 'aman', trend: 'Stabil (+0.5%)' },
    ];

    return (
        <FaskesLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-primary-900 flex items-center gap-2">
                            <span>🗺️ Persebaran & Analisis Risiko Epidemiologi</span>
                        </h2>
                        <p className="text-[11px] text-gray-500">Filter pasien remaja dan pemetaan risiko diabetes berdasarkan wilayah pelayanan</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'table' ? 'bg-[#2E7D32] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>📋 Daftar Pasien</span>
                            </button>
                            <button
                                onClick={() => setViewMode('territory')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'territory' ? 'bg-[#2E7D32] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>📍 Pemetaan Wilayah</span>
                            </button>
                        </div>
                        <Link
                            href={route('faskes.dashboard')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                        >
                            <span>⬅ Kembali</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Distribusi Risiko & Wilayah - Faskes Admin" />

            {/* ── MODE 1: DAFTAR PASIEN TERFILTER (Page detail persebaran resiko diabetes faskes.png) ── */}
            {viewMode === 'table' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Filter Status Pills */}
                    <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route('faskes.risk-distribution')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                                    !filters.status
                                        ? 'bg-[#2E7D32] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                }`}
                            >
                                🌐 Semua Status ({totalAll})
                            </Link>
                            <Link
                                href={route('faskes.risk-distribution', { status: 'bahaya' })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                                    filters.status === 'bahaya'
                                        ? 'bg-[#EF4444] text-white'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                }`}
                            >
                                <span>🚨 Bahaya ({distribution.bahaya || 0})</span>
                            </Link>
                            <Link
                                href={route('faskes.risk-distribution', { status: 'waspada' })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                                    filters.status === 'waspada'
                                        ? 'bg-[#EAB308] text-gray-900'
                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                }`}
                            >
                                <span>⚠️ Waspada ({distribution.waspada || 0})</span>
                            </Link>
                            <Link
                                href={route('faskes.risk-distribution', { status: 'aman' })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                                    filters.status === 'aman'
                                        ? 'bg-[#22C55E] text-white'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                            >
                                <span>✅ Aman ({distribution.aman || 0})</span>
                            </Link>
                        </div>
                        <div className="text-xs font-semibold text-gray-400">
                            Menampilkan <span className="text-gray-700 font-bold">{patients.data?.length || 0}</span> dari <span className="text-gray-700 font-bold">{patients.total || patients.data?.length || 0}</span> remaja
                        </div>
                    </div>

                    {/* Tabel Pasien Hasil Filter */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-800 text-md">
                                    📋 Daftar Pasien Terfilter ({patients.total || patients.data?.length || 0} Data)
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Daftar remaja beserta pemantauan kadar gula darah sewaktu (GDS) dan riwayat</p>
                            </div>
                        </div>

                        {patients.data && patients.data.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="text-4xl mb-2">📭</div>
                                <p className="font-semibold text-gray-700">Tidak ada pasien dengan kriteria filter yang dipilih.</p>
                                <p className="text-xs text-gray-400 mt-1">Gunakan tombol filter di atas untuk menampilkan status risiko yang lain.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="p-4">Pasien & ID</th>
                                            <th className="p-4">Usia & Biometrik</th>
                                            <th className="p-4">GDS Terkini</th>
                                            <th className="p-4">Batas Gula Harian</th>
                                            <th className="p-4">Status Risiko</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {patients.data && patients.data.map((patient) => {
                                            const badge = getStatusBadge(patient.current_risk_status);
                                            const latestLog = patient.blood_sugar_logs && patient.blood_sugar_logs.length > 0
                                                ? patient.blood_sugar_logs[0]
                                                : null;

                                            return (
                                                <tr key={patient.id} className="hover:bg-gray-50/60 transition">
                                                    <td className="p-4 font-bold text-gray-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 font-black flex items-center justify-center text-xs border border-primary-200">
                                                                {(patient.user?.name || 'P')[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm">{patient.user?.name || 'Pasien'}</div>
                                                                <div className="text-[10px] text-gray-400 font-normal">{patient.user?.email || 'No email'} | ID #{patient.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-600">
                                                        <div className="font-bold text-gray-800">{patient.age ? `${patient.age} Thn` : 'Remaja'}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                            BB: {patient.weight_kg || '-'} kg | TB: {patient.height_cm || '-'} cm
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {latestLog ? (
                                                            <div>
                                                                <span className={`font-black text-sm ${latestLog.glucose_level >= 126 ? 'text-red-600' : latestLog.glucose_level >= 100 ? 'text-amber-600' : 'text-gray-800'}`}>
                                                                    {latestLog.glucose_level} mg/dL
                                                                </span>
                                                                <div className="text-[10px] text-gray-400">{new Date(latestLog.measurement_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Belum cek GDS</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 font-black text-[#2E7D32] text-sm">{patient.daily_sugar_limit_g || 25}g / hari</td>
                                                    <td className="p-4">
                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {patients.links && patients.links.length > 3 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-1.5 bg-gray-50/50">
                                {patients.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-[#2E7D32] text-white shadow-xs'
                                                : link.url
                                                    ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                    : 'text-gray-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── MODE 2: PEMETAAN RISIKO PER WILAYAH (Page detail resiko diabetes per wilayah.png) ── */}
            {viewMode === 'territory' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-gradient-to-r from-gray-900 via-primary-900 to-[#2E7D32] p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-800">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">Geospasial & Epidemiologi</span>
                            <h3 className="text-xl font-black mt-2">Pemetaan Risiko Diabetes Per Wilayah Pelayanan</h3>
                            <p className="text-xs text-emerald-100 mt-1">Klasterisasi tingkat bahaya berdasarkan puskesmas binaan dan sekolah menengah (SMP/SMA)</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center sm:text-right min-w-[160px]">
                            <div className="text-[10px] font-bold text-emerald-200 uppercase">Total Wilayah Binaan</div>
                            <div className="text-3xl font-black text-white">{territories.length} Puskesmas</div>
                        </div>
                    </div>

                    {/* Ringkasan Status Wilayah */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4.5 rounded-2xl border border-red-200 bg-red-50/30 shadow-2xs">
                            <div className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center justify-between">
                                <span>🚨 Zona Merah (Intervensi Prioritas)</span>
                                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">2 Wilayah</span>
                            </div>
                            <p className="text-xs text-red-700 mt-2 font-medium">Kebayoran Baru & Pasar Minggu menunjukkan peningkatan tren GDS ≥126 mg/dL di atas 15% populasi.</p>
                        </div>

                        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-2xs">
                            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                                <span>⚠️ Zona Kuning (Pantauan Ketat)</span>
                                <span className="bg-amber-500 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-full">1 Wilayah</span>
                            </div>
                            <p className="text-xs text-amber-700 mt-2 font-medium">Tebet Barat memiliki prevalensi status Waspada tinggi karena tingginya konsumsi minuman manis kemasan.</p>
                        </div>

                        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
                            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                                <span>✅ Zona Hijau (Terkontrol)</span>
                                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">2 Wilayah</span>
                            </div>
                            <p className="text-xs text-emerald-700 mt-2 font-medium">Setiabudi & Cilandak menunjukkan angka ketaatan batas gula harian tertinggi di atas 75%.</p>
                        </div>
                    </div>

                    {/* Tabel Analisis Per Wilayah */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
                            <div>
                                <h3 className="font-bold text-gray-800 text-md">🗺️ Detail Indikator Risiko Per Wilayah Kerja</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Disagregasi jumlah remaja dalam status Bahaya, Waspada, dan Aman per wilayah puskesmas</p>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4">Nama Wilayah / Puskesmas</th>
                                        <th className="p-4">Cakupan Sekolah Bina</th>
                                        <th className="p-4">Distribusi Status Risiko (Populasi)</th>
                                        <th className="p-4">Tren 30 Hari</th>
                                        <th className="p-4 text-right">Status Zona</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                    {territories.map((t) => {
                                        const total = t.total_teens;
                                        const bPct = Math.round((t.bahaya / total) * 100);
                                        const wPct = Math.round((t.waspada / total) * 100);
                                        const aPct = Math.round((t.aman / total) * 100);

                                        return (
                                            <tr key={t.id} className="hover:bg-gray-50/60 transition">
                                                <td className="p-4 font-bold text-gray-800">
                                                    <div className="text-sm">{t.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-normal">Total Surveilans: {t.total_teens} Remaja</div>
                                                </td>
                                                <td className="p-4 font-semibold text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>🏫 {t.schools}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 w-64">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span className="text-red-600">🚨 {t.bahaya} ({bPct}%)</span>
                                                            <span className="text-amber-600">⚠️ {t.waspada} ({wPct}%)</span>
                                                            <span className="text-emerald-600">✅ {t.aman} ({aPct}%)</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden border border-gray-200">
                                                            <div className="bg-[#EF4444] h-full" style={{ width: `${bPct}%` }}></div>
                                                            <div className="bg-[#EAB308] h-full" style={{ width: `${wPct}%` }}></div>
                                                            <div className="bg-[#22C55E] h-full" style={{ width: `${aPct}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold">
                                                    <span className={t.trend.includes('+') ? 'text-red-600' : t.trend.includes('-') ? 'text-emerald-600' : 'text-gray-600'}>
                                                        {t.trend}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                                        t.status === 'bahaya' ? 'bg-[#EF4444] text-white' : t.status === 'waspada' ? 'bg-[#EAB308] text-gray-900' : 'bg-[#22C55E] text-white'
                                                    }`}>
                                                        {t.status === 'bahaya' ? 'Zona Merah' : t.status === 'waspada' ? 'Zona Kuning' : 'Zona Hijau'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </FaskesLayout>
    );
}
