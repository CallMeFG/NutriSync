import React, { useState, useEffect } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

// Countdown timer hook
function useCountdown() {
    const [timeLeft, setTimeLeft] = useState(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        return Math.max(0, Math.floor((midnight - now) / 1000));
    });

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Warna dan Ikon Aset Voucher dari Figma
const voucherIconMap = {
    'GoPay':       { img: '/icons/gopay.png',        bg: 'bg-[#1565C0]' },
    'Ovo':         { img: '/icons/ovo.png',          bg: 'bg-[#4B3B8C]' },
    'Grab':        { img: '/icons/grab.png',         bg: 'bg-[#00B14F]' },
    'Makanan':     { img: '/icons/makanan.png',      bg: 'bg-[#2E7D32]' },
    'Minuman':     { img: '/icons/minuman.png',      bg: 'bg-[#795548]' },
    'Sports Gear': { img: '/icons/sepatu-sport.png', bg: 'bg-[#263238]' },
};

const getVoucherAsset = (title = '', category = '') => {
    for (const [key, val] of Object.entries(voucherIconMap)) {
        if (title.toLowerCase().includes(key.toLowerCase())) return val;
    }
    if (category === 'E-Wallet') return { img: '/icons/gopay.png', bg: 'bg-[#1565C0]' };
    if (category === 'Makanan & Minuman') return { img: '/icons/makanan.png', bg: 'bg-[#2E7D32]' };
    return { img: null, bg: 'bg-gradient-to-br from-slate-700 to-slate-900' };
};

const CATEGORIES = ['Semua', 'E-Wallet', 'Makanan & Minuman', 'Olahraga'];

export default function RewardsIndex({
    nutriPoints  = 0,
    streakCount  = 0,
    level        = 1,
    pointsToNext = 500,
    rewards      = [],
    myClaims     = [],
    missions     = [],
}) {
    const { flash, errors } = usePage().props;
    const [viewMode, setViewMode] = useState('missions'); // 'missions' | 'catalog' | 'history'
    const [categoryTab, setCategoryTab] = useState('Semua');
    
    // Modal Tukar & Konfirmasi Sukses State (Page tukar poin.png & Page konfirmasi tukar.png)
    const [selectedReward, setSelectedReward] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [claimedCode, setClaimedCode] = useState(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const countdown = useCountdown();

    const handleOpenExchangeModal = (reward) => {
        setSelectedReward(reward);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmExchange = () => {
        if (!selectedReward) return;
        setIsClaiming(true);

        router.post(route('patient.rewards.claim', selectedReward.id), {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsClaiming(false);
                setIsConfirmModalOpen(false);
                // Coba ambil voucher code terbaru atau generate format standard
                const newCode = page.props.flash?.voucher_code || `NS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                setClaimedCode(newCode);
                setIsSuccessModalOpen(true);
            },
            onError: () => {
                setIsClaiming(false);
                setIsConfirmModalOpen(false);
            },
            onFinish: () => {
                setIsClaiming(false);
            }
        });
    };

    const handleCopyCode = () => {
        if (navigator.clipboard && claimedCode) {
            navigator.clipboard.writeText(claimedCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2500);
        }
    };

    const filteredRewards = categoryTab === 'Semua'
        ? rewards
        : rewards.filter(r => r.category === categoryTab);

    const defaultMissions = [
        { title: 'Catat Gula Darah Puasa', sub: 'Lakukan sebelum sarapan pagi ini', points: 30, progress: 0, target: 1, icon: '🩸' },
        { title: 'Pindai Kemasan Makanan', sub: 'Scan 2 barcode produk apapun hari ini', points: 25, progress: 1, target: 2, icon: '📷' },
        { title: 'Minum Air Putih 8 Gelas', sub: 'Jaga hidrasi untuk kelancaran ginjal', points: 20, progress: 4, target: 8, icon: '💧' },
        { title: 'Aktivitas Fisik Aerobik', sub: 'Berjalan kaki ringan 30 menit', points: 35, progress: 15, target: 30, icon: '🏃‍♂️' },
    ];
    const activeMissions = missions && missions.length > 0 ? missions : defaultMissions;

    return (
        <PatientLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={route('patient.dashboard')} className="text-gray-500 hover:text-slate-900 p-1.5 rounded-xl bg-gray-100 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">🏆 Pusat Misi & Katalog Reward</h2>
                            <p className="text-xs text-gray-500">Selesaikan misi sehat harian & tukarkan NutriPoin dengan voucher diskon</p>
                        </div>
                    </div>

                    {/* Navigasi Tab Atas (Misi | Katalog | Riwayat) */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl self-start sm:self-auto border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => setViewMode('missions')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                viewMode === 'missions'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-gray-500 hover:text-slate-900'
                            }`}
                        >
                            <span>🎯 Misi Harian</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('catalog')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                viewMode === 'catalog'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-gray-500 hover:text-slate-900'
                            }`}
                        >
                            <span>🛍️ Katalog Voucher</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('history')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                viewMode === 'history'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-gray-500 hover:text-slate-900'
                            }`}
                        >
                            <span>📜 Riwayat ({myClaims.length})</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Misi & Reward — NutriSync" />

            <div className="space-y-6 pb-24">
                {/* Flash Messages */}
                {flash?.success && !isSuccessModalOpen && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <span>🎉</span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {errors?.reward && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{errors.reward}</span>
                    </div>
                )}

                {/* ── Banner Saldo NutriPoin + Streak & Level ──────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Saldo Poin */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
                        <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-4 -bottom-8 w-48 opacity-25 select-none pointer-events-none" />
                        
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <div className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Total Saldo NutriPoin Anda</div>
                                <div className="flex items-center gap-2.5">
                                    <img src="/icons/koin-emas.png" alt="" className="w-9 h-9 object-contain drop-shadow-sm" />
                                    <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
                                        {nutriPoints.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-xs opacity-85 mt-2.5 max-w-sm leading-relaxed">
                                    Poin bertambah setiap Anda mencatat gula darah, memindai makanan sehat, atau berolahraga!
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewMode('catalog')}
                                className="bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition border border-white/30 backdrop-blur-xs flex items-center gap-1.5"
                            >
                                <span>Tukar Voucher →</span>
                            </button>
                        </div>
                    </div>

                    {/* Streak & Level Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0 font-bold">
                                🔥
                            </div>
                            <div>
                                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Streak Konsistensi</div>
                                <div className="flex items-end gap-1 mt-0.5">
                                    <span className="text-2xl font-black text-slate-900">{streakCount}</span>
                                    <span className="text-xs font-bold text-gray-500 mb-0.5">Hari Berturut</span>
                                </div>
                                <div className="text-[10px] text-[#22C55E] font-extrabold mt-0.5">✓ Aktif Hari Ini</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                                <span className="bg-[#22C55E] text-white px-2 py-1 rounded-xl">Lv.{level}</span>
                            </div>
                            <div>
                                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Peringkat Remaja</div>
                                <div className="text-sm font-black text-slate-900 mt-0.5">Pejuang Sehat</div>
                                <div className="text-[10px] font-semibold text-gray-500 mt-0.5">{pointsToNext} poin menuju Lv.{level + 1}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TAB 1: MISI & REWARD (Page misi & reward.png) ────────── */}
                {viewMode === 'missions' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 gap-2 bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                                    <span>🎯 Daftar Misi Harian Remaja</span>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                        Reset Tiap Malam
                                    </span>
                                </h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Selesaikan aktivitas positif hari ini untuk mendapatkan tambahan NutriPoin secara otomatis.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
                                <span>⏳ Sisa Waktu:</span>
                                <span className="font-mono font-black">{countdown}</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {activeMissions.map((mission, idx) => {
                                const isDone = mission.progress >= mission.target;
                                return (
                                    <div key={idx} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${isDone ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-xs ${
                                                isDone ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {isDone ? '✓' : (mission.icon || '📌')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${isDone ? 'line-through text-gray-400' : 'text-slate-900'}`}>
                                                        {mission.title}
                                                    </span>
                                                    {isDone && <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">Selesai</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{mission.sub}</div>

                                                {/* Progress bar */}
                                                {mission.target > 1 && !isDone && (
                                                    <div className="mt-2.5 max-w-xs space-y-1">
                                                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                                            <span>Kemajuan Misi</span>
                                                            <span>{mission.progress} / {mission.target}</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full transition-all duration-300"
                                                                style={{ width: `${Math.min(100, Math.round((mission.progress / mission.target) * 100))}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60">
                                                <img src="/icons/koin-emas.png" alt="" className="w-4 h-4 object-contain" />
                                                <span className="text-xs font-black text-amber-800">+{mission.points} Poin</span>
                                            </div>
                                            {isDone ? (
                                                <span className="text-xs font-extrabold text-emerald-600 px-3 py-1.5">Sudah Diklaim</span>
                                            ) : (
                                                <Link
                                                    href={mission.title?.toLowerCase().includes('gula') ? route('patient.blood-sugar.index') : route('patient.nutrition.index')}
                                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                                >
                                                    Kerjakan →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── TAB 2: KATALOG VOUCHER (Page katalog voucher.png) ────── */}
                {viewMode === 'catalog' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                            <div>
                                <h3 className="font-black text-slate-900 text-sm">🛍️ Pilihan Voucher & E-Wallet</h3>
                                <p className="text-xs text-gray-500">Pilih e-wallet atau voucher makanan sehat untuk ditukarkan dengan poinmu.</p>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategoryTab(cat)}
                                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                            categoryTab === cat
                                                ? 'bg-[#1E88E5] text-white shadow-sm'
                                                : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredRewards.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center space-y-2">
                                <div className="text-4xl">🎁</div>
                                <div className="text-sm font-bold text-slate-800">Voucher Kategori Ini Belum Tersedia</div>
                                <p className="text-xs text-gray-400">Silakan cek kategori lain atau tunggu update reward berikutnya!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredRewards.map(reward => {
                                    const canClaim = nutriPoints >= reward.points_required && reward.stock > 0;
                                    const asset = getVoucherAsset(reward.title, reward.category);
                                    return (
                                        <div
                                            key={reward.id}
                                            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden group"
                                        >
                                            {/* Header Brand Banner */}
                                            <div className={`${asset.bg} h-32 flex items-center justify-center relative p-4 overflow-hidden`}>
                                                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-xs text-white text-[10px] font-extrabold">
                                                    Stok: {reward.stock}
                                                </div>
                                                {asset.img ? (
                                                    <img src={asset.img} alt={reward.title} className="h-16 object-contain drop-shadow-md group-hover:scale-105 transition duration-300" />
                                                ) : (
                                                    <span className="text-5xl drop-shadow">🎁</span>
                                                )}
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{reward.category || 'Voucher'}</div>
                                                    <h4 className="font-black text-slate-900 text-base mt-0.5 line-clamp-1">{reward.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                        {reward.description || 'Voucher diskon e-wallet resmi yang dapat digunakan di merchant rekanan NutriSync.'}
                                                    </p>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-sm">
                                                        <img src="/icons/koin-emas.png" alt="" className="w-4 h-4 object-contain" />
                                                        <span>{reward.points_required.toLocaleString('id-ID')} Poin</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenExchangeModal(reward)}
                                                        disabled={!canClaim}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                                                            canClaim
                                                                ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-95 text-white active:scale-95'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {canClaim ? 'Tukar Sekarang' : reward.stock <= 0 ? 'Stok Habis' : 'Poin Kurang'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: RIWAYAT PENUKARAN (Page Riwayat) ────────────── */}
                {viewMode === 'history' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-slate-900 text-sm">📜 Riwayat Penukaran Voucher</h3>
                                <p className="text-xs text-gray-500">Daftar kode voucher yang telah Anda klaim sebelumnya</p>
                            </div>
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                Total {myClaims.length} Klaim
                            </span>
                        </div>

                        {myClaims.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 space-y-2">
                                <div className="text-4xl">🏷️</div>
                                <div className="text-sm font-bold text-slate-800">Belum Ada Riwayat Penukaran</div>
                                <p className="text-xs">Tukarkan poin yang Anda kumpulkan dengan voucher di menu Katalog Voucher.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {myClaims.map((claim, idx) => {
                                    const asset = getVoucherAsset(claim.reward?.title || '', claim.reward?.category || '');
                                    return (
                                        <div key={claim.id || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                                            <div className="flex items-center gap-3.5">
                                                <div className={`w-12 h-12 rounded-2xl ${asset.bg} flex items-center justify-center p-2 flex-shrink-0 shadow-xs`}>
                                                    {asset.img ? (
                                                        <img src={asset.img} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-xl">🎁</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900">{claim.reward?.title || 'Voucher Reward'}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Diklaim pada {new Date(claim.claimed_at || claim.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Kode Voucher Resmi</div>
                                                    <div className="font-mono text-xs font-black text-[#22C55E] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl tracking-wider mt-0.5">
                                                        {claim.voucher_code || 'NS-VOCH123'}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(claim.voucher_code || 'NS-VOCH123');
                                                        alert('Kode voucher berhasil disalin!');
                                                    }}
                                                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                                                    title="Salin Kode"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── MODAL 1: FORM TUKAR POIN (Page tukar poin.png) ────────── */}
            {isConfirmModalOpen && selectedReward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 space-y-5 relative animate-scaleUp">
                        {/* Tombol Close */}
                        <button
                            type="button"
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold text-sm transition"
                        >
                            ✕
                        </button>

                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E88E5] flex items-center justify-center mx-auto text-3xl shadow-sm">
                                🛒
                            </div>
                            <h3 className="text-lg font-black text-slate-900">Konfirmasi Tukar Poin</h3>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                Anda akan menukarkan NutriPoin dengan voucher diskon/e-wallet pilihan.
                            </p>
                        </div>

                        {/* Card Ringkasan Item */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200/70 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl ${getVoucherAsset(selectedReward.title, selectedReward.category).bg} flex items-center justify-center p-2 flex-shrink-0`}>
                                    {getVoucherAsset(selectedReward.title, selectedReward.category).img ? (
                                        <img src={getVoucherAsset(selectedReward.title, selectedReward.category).img} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xl">🎁</span>
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900">{selectedReward.title}</div>
                                    <div className="text-xs text-gray-500">{selectedReward.category || 'Voucher E-Wallet'}</div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Saldo Poin Anda Sekarang:</span>
                                    <span className="font-bold">{nutriPoints.toLocaleString('id-ID')} Poin</span>
                                </div>
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Biaya Penukaran:</span>
                                    <span>-{selectedReward.points_required.toLocaleString('id-ID')} Poin</span>
                                </div>
                                <div className="flex justify-between text-emerald-700 font-black text-sm pt-1 border-t border-dashed border-gray-200">
                                    <span>Sisa Saldo Setelah Tukar:</span>
                                    <span>{(nutriPoints - selectedReward.points_required).toLocaleString('id-ID')} Poin</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(false)}
                                disabled={isClaiming}
                                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmExchange}
                                disabled={isClaiming}
                                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold text-xs shadow-md hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isClaiming ? '⏳ Memproses...' : '✓ Ya, Tukar Sekarang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL 2: KONFIRMASI SUKSES (Page konfirmasi tukar.png) ── */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-6 space-y-5 text-center relative animate-scaleUp">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#22C55E] flex items-center justify-center mx-auto text-4xl shadow-md border-4 border-emerald-50">
                            🎉
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">Penukaran Berhasil!</h3>
                            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                                Voucher Anda telah aktif dan siap digunakan. Simpan atau salin kode resmi di bawah ini.
                            </p>
                        </div>

                        {/* Kode Voucher Box */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-300/80 p-4 rounded-2xl space-y-1.5">
                            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">KODE VOUCHER ANDA</div>
                            <div className="text-2xl font-black font-mono tracking-wider text-emerald-700 bg-white py-2.5 px-4 rounded-xl shadow-xs border border-emerald-200">
                                {claimedCode || 'NS-GOPAY50K'}
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline pt-1 flex items-center justify-center gap-1 mx-auto"
                            >
                                <span>{copiedCode ? '✓ Kode Tersalin!' : '📋 Salin Kode ke Clipboard'}</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl text-[11px] text-gray-600 leading-snug border border-gray-100 text-left flex items-start gap-2.5">
                            <span className="text-sm">💡</span>
                            <div>
                                <b className="text-slate-800">Cara Penggunaan:</b> Buka aplikasi e-wallet atau merchant rekanan, pilih menu "Klaim Voucher / Promo Code", dan tempelkan kode di atas saat checkout.
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSuccessModalOpen(false);
                                    setViewMode('history');
                                }}
                                className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-md"
                            >
                                Lihat di Riwayat
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSuccessModalOpen(false)}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition"
                            >
                                Selesai & Kembali
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PatientLayout>
    );
}
