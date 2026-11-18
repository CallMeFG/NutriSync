import React, { useState } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, Link } from '@inertiajs/react';

export default function FamilySyncIndex({ patient = null, pairingCode = 'SYNC123', caregivers = [], alerts = [] }) {
    const [copied, setCopied] = useState(false);

    const handleCopyPin = () => {
        if (navigator.clipboard && pairingCode) {
            navigator.clipboard.writeText(pairingCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

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
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">👨‍👩‍👧 Family Sync & Notifikasi</h2>
                            <p className="text-xs text-gray-500">Koneksi pengawasan darurat ke Orang Tua & riwayat WhatsApp Alert</p>
                        </div>
                    </div>
                    <Link
                        href={route('pairing.show')}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-1.5"
                    >
                        <span>🔗 Atur Koneksi PIN</span>
                    </Link>
                </div>
            }
        >
            <Head title="Family Sync — NutriSync" />

            <div className="space-y-6 pb-20">
                {/* ── Banner Status Koneksi Orang Tua ──────────────────────── */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-4 -top-4 w-36 h-auto opacity-15 select-none pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {caregivers.length > 0 ? 'TERHUBUNG DENGAN ORANG TUA' : 'STATUS PAIRING AKTIF'}
                                </span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight mt-1">Koneksi Pengawasan Keluarga</h3>
                            <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                                {caregivers.length > 0
                                    ? `Akun Anda sedang dipantau oleh ${caregivers.length} Orang Tua / Wali. Peringatan klinis akan otomatis dikirim via WhatsApp saat glukosa melewati batas.`
                                    : 'Bagikan PIN Pairing Anda di bawah ini kepada Orang Tua agar mereka dapat memantau kondisi dan menerima notifikasi darurat.'}
                            </p>
                        </div>

                        {/* PIN Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center justify-between gap-4 flex-shrink-0">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIN Pairing Remaja</div>
                                <div className="text-2xl font-black tracking-widest text-emerald-400 font-mono mt-0.5">
                                    {pairingCode}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyPin}
                                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm hover:bg-emerald-50 active:scale-95 transition flex items-center gap-1.5"
                            >
                                {copied ? (
                                    <>
                                        <span className="text-emerald-600">✓</span>
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📋</span>
                                        <span>Salin PIN</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Daftar Orang Tua Terhubung */}
                    {caregivers.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {caregivers.map((cg, i) => (
                                <div key={cg.id || i} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                                            {(cg.name || 'O').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{cg.name || 'Orang Tua'}</div>
                                            <div className="text-[11px] text-slate-400">{cg.phone_number || cg.email || 'Akun Keluarga'}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                        Aktif
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Riwayat Notifikasi Darurat (WhatsApp Alert Log) ──────── */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div>
                            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <span>💬 Riwayat Pengiriman Peringatan WhatsApp (Alerts)</span>
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                Log pesan otomatis yang dikirim oleh sistem ke Orang Tua / Wali
                            </p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            WhatsApp / Fonnte Active
                        </span>
                    </div>

                    {alerts && alerts.length > 0 ? (
                        <div className="space-y-3">
                            {alerts.map((alert, idx) => (
                                <div
                                    key={alert.id || idx}
                                    className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                                        alert.type === 'bahaya'
                                            ? 'bg-red-50/70 border-red-200 text-red-900'
                                            : 'bg-amber-50/70 border-amber-200 text-amber-900'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base shadow-xs ${
                                        alert.type === 'bahaya' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                                    }`}>
                                        {alert.type === 'bahaya' ? '🚨' : '⚠️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-xs font-black">{alert.title}</div>
                                            <span className="text-[10px] opacity-75 font-mono whitespace-nowrap">{alert.time}</span>
                                        </div>
                                        <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                                            {alert.message}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold opacity-75">
                                            <span>📤 Jalur: {alert.sent_via}</span>
                                            <span>•</span>
                                            <span>Penerima: Orang Tua Terhubung</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                                ✓
                            </div>
                            <div className="text-xs font-bold text-slate-800">Belum Ada Peringatan Darurat Terkirim</div>
                            <p className="text-[11px] text-gray-500 max-w-sm">
                                Kondisi gula darah Anda dalam periode ini stabil dan aman (&lt;100 mg/dL). Sistem tidak mengirimkan peringatan darurat ke Orang Tua.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Edukasi Family Sync ───────────────────────────────────── */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl p-4.5 border border-blue-100 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-lg shadow-sm">
                        🛡️
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs font-black text-blue-900">Bagaimana Family Sync Bekerja?</div>
                        <p className="text-[11px] text-blue-800/80 leading-relaxed font-medium">
                            NutriSync menjaga keamanan klinismu tanpa mengurangi privasimu. Orang Tua hanya menerima notifikasi darurat jika gula darahmu di zona <b>Waspada (100–125 mg/dL)</b> atau <b>Bahaya (≥126 mg/dL)</b> agar kamu segera mendapat penanganan yang tepat.
                        </p>
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
