import React, { useState } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function ActivityLog({
    todayWater = 0,
    todayExercise = 0,
    recentLogs = [],
    streak = 0,
    nutriPoints = 0,
}) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('water'); // 'water' | 'exercise'

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'water',
        value: 1,
    });

    const handleTabChange = (type) => {
        setActiveTab(type);
        setData({
            type: type,
            value: type === 'water' ? 1 : 30,
        });
    };

    const handleQuickSubmit = (type, val) => {
        post(route('patient.activity.store'), {
            data: { type, value: val },
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        post(route('patient.activity.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    // Target harian medis standar
    const targetWater = 8; // 8 gelas
    const targetExercise = 30; // 30 menit
    const waterPct = Math.min(100, Math.round((todayWater / targetWater) * 100));
    const exercisePct = Math.min(100, Math.round((todayExercise / targetExercise) * 100));

    return (
        <PatientLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>🏃‍♂️ Pelacak Aktivitas & Air Minum</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200">
                        <span>🪙 {nutriPoints} Poin</span>
                    </div>
                </div>
            }
        >
            <Head title="Pelacak Aktivitas & Air Minum - Pasien" />

            <div className="space-y-6 pb-20 animate-fadeIn">
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                        <span>✅</span>
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* ── Banner Motivasi & Progress Harian ───────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kartu Target Air Minum */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between z-10 relative">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                                    Hydration Tracker
                                </span>
                                <h3 className="text-xl font-black mt-2">Air Minum Hari Ini</h3>
                                <div className="text-3xl font-black mt-1">
                                    {todayWater} <span className="text-sm font-normal text-blue-200">/ {targetWater} Gelas</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-3xl">
                                💧
                            </div>
                        </div>
                        <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-300 h-full transition-all duration-500" style={{ width: `${waterPct}%` }}></div>
                        </div>
                        <div className="text-[10px] text-blue-100 mt-1.5 font-medium flex justify-between">
                            <span>{waterPct >= 100 ? '🎉 Target tercapai!' : 'Jaga tubuh tetap terhidrasi'}</span>
                            <span>{waterPct}%</span>
                        </div>
                    </div>

                    {/* Kartu Target Olahraga */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between z-10 relative">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                                    Fitness Tracker
                                </span>
                                <h3 className="text-xl font-black mt-2">Olahraga Hari Ini</h3>
                                <div className="text-3xl font-black mt-1">
                                    {todayExercise} <span className="text-sm font-normal text-emerald-200">/ {targetExercise} Menit</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-3xl">
                                🏃‍♂️
                            </div>
                        </div>
                        <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-300 h-full transition-all duration-500" style={{ width: `${exercisePct}%` }}></div>
                        </div>
                        <div className="text-[10px] text-emerald-100 mt-1.5 font-medium flex justify-between">
                            <span>{exercisePct >= 100 ? '🔥 Luar biasa! Target tercapai' : 'Olahraga aerobik 30 mnt/hari'}</span>
                            <span>{exercisePct}%</span>
                        </div>
                    </div>
                </div>

                {/* ── Form Catat Aktivitas (Quick Action & Custom) ────────── */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div>
                            <h3 className="text-base font-black text-slate-900">📝 Catat Aktivitas Harian</h3>
                            <p className="text-xs text-gray-500">Setiap pencatatan harian memberikan NutriPoin & menjaga Streak aktif!</p>
                        </div>
                        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => handleTabChange('water')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeTab === 'water' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>💧 Minum Air</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTabChange('exercise')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    activeTab === 'exercise' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <span>🏃‍♂️ Olahraga</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab 1: Air Minum */}
                    {activeTab === 'water' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">⚡ Tambah Cepat (Gelas 250ml)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('water', 1)}
                                        disabled={processing}
                                        className="bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 text-blue-700 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">🥛</span>
                                        <span className="text-xs">+1 Gelas</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('water', 2)}
                                        disabled={processing}
                                        className="bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 text-blue-700 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">🥛🥛</span>
                                        <span className="text-xs">+2 Gelas</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('water', 4)}
                                        disabled={processing}
                                        className="bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 text-blue-700 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">🚰</span>
                                        <span className="text-xs">+4 Gelas (1 Liter)</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-gray-100 flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Atau Input Kustom (Jumlah Gelas)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md h-[42px]"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan →'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tab 2: Olahraga */}
                    {activeTab === 'exercise' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">⚡ Pilihan Cepat Waktu Olahraga</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('exercise', 15)}
                                        disabled={processing}
                                        className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 text-emerald-800 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">🚶‍♂️</span>
                                        <span className="text-xs">+15 Menit Jalan</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('exercise', 30)}
                                        disabled={processing}
                                        className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 text-emerald-800 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">🏃‍♂️</span>
                                        <span className="text-xs">+30 Menit Aerobik</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('exercise', 45)}
                                        disabled={processing}
                                        className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 text-emerald-800 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">🚴‍♂️</span>
                                        <span className="text-xs">+45 Menit Sepeda</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickSubmit('exercise', 60)}
                                        disabled={processing}
                                        className="bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 text-emerald-800 font-bold py-3 rounded-xl transition text-center flex flex-col items-center gap-1"
                                    >
                                        <span className="text-xl">⚽</span>
                                        <span className="text-xs">+60 Menit Olahraga</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-gray-100 flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Atau Input Kustom (Durasi Menit)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md h-[42px]"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan →'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* ── Riwayat Aktivitas Terbaru ───────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                    <h3 className="font-black text-slate-900 text-sm mb-4 border-b border-gray-100 pb-3">
                        🕒 Riwayat Aktivitas Anda ({recentLogs.length})
                    </h3>

                    {recentLogs.length > 0 ? (
                        <ul className="divide-y divide-gray-100 text-xs">
                            {recentLogs.map((log, idx) => (
                                <li key={idx} className="py-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                                            log.type === 'water' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {log.type === 'water' ? '💧' : '🏃‍♂️'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">
                                                {log.type === 'water' ? `Minum Air Bersih (${log.value} Gelas)` : `Aktivitas Fisik / Olahraga (${log.value} Menit)`}
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                {log.logged_at ? new Date(log.logged_at).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                }) : ''}
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
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="text-xs font-medium">Belum ada aktivitas tercatat.</p>
                            <p className="text-[11px] mt-0.5">Gunakan tombol cepat di atas untuk mencatat hidrasi & olahraga hari ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </PatientLayout>
    );
}
