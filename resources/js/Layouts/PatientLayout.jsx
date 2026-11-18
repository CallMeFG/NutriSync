import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { getUnsyncedCount, syncQueue } from '@/lib/offlineQueue';

export default function PatientLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [unsyncedCount, setUnsyncedCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const checkQueue = async () => {
        try {
            const count = await getUnsyncedCount();
            setUnsyncedCount(count);
        } catch (e) {
            console.warn(e);
        }
    };

    useEffect(() => {
        checkQueue();
        window.addEventListener('nutrisync:queue-updated', checkQueue);
        window.addEventListener('online', checkQueue);
        return () => {
            window.removeEventListener('nutrisync:queue-updated', checkQueue);
            window.removeEventListener('online', checkQueue);
        };
    }, []);

    const handleManualSync = async () => {
        setIsSyncing(true);
        await syncQueue();
        await checkQueue();
        setIsSyncing(false);
    };

    // Active route helper
    const isActive = (routeName) => {
        try { return route().current(routeName); } catch { return false; }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
            {/* ── Top Header ─────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo NutriSync (ikon shield hijau dari Figma) */}
                    <Link href={route('patient.dashboard')} className="flex items-center gap-2">
                        <img
                            src="/icons/pelindung.png"
                            alt="NutriSync"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="font-bold text-lg md:text-xl tracking-tight text-primary-900">NutriSync</span>
                    </Link>

                    {/* Desktop Nav (Muncul di layar md ke atas) */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
                        <Link href={route('patient.dashboard')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.dashboard') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>🏠 Beranda</span>
                        </Link>
                        <Link href={route('patient.blood-sugar.trend')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.blood-sugar.trend') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>📈 Riwayat Gula</span>
                        </Link>
                        <Link href={route('patient.nutrition.index')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.nutrition.index') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>📷 Pindai Makanan</span>
                        </Link>
                        <Link href={route('patient.activity.index')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.activity.index') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>🏃‍♂️ Aktivitas</span>
                        </Link>
                        <Link href={route('patient.rewards.index')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.rewards.index') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>🏆 Misi & Rewards</span>
                        </Link>
                        <Link href={route('patient.health-summary')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.health-summary') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>💡 Insights Klinis</span>
                        </Link>
                        <Link href={route('patient.family-sync.index')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${isActive('patient.family-sync.index') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>👨‍👩‍👧 Family Sync</span>
                        </Link>
                    </nav>

                    {/* Right: Bell + Avatar */}
                    <div className="flex items-center gap-3">
                        <button type="button" id="btn-notif" className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <Link href={route('profile.edit')} id="btn-profile" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-700 hover:ring-2 hover:ring-primary-500 transition">
                            {user.name.charAt(0).toUpperCase()}
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Offline Queue Banner ──────────────────────────────── */}
            {unsyncedCount > 0 && (
                <div className="bg-amber-500 text-white px-4 py-2.5 text-xs font-bold flex justify-between items-center">
                    <span className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full flex justify-between items-center px-4">
                        <span>⚠️ {unsyncedCount} data medis belum tersinkron ke server.</span>
                        <button type="button" onClick={handleManualSync} disabled={isSyncing}
                            className="bg-white text-amber-900 px-3 py-1 rounded-lg shadow-sm hover:bg-amber-50 transition font-bold disabled:opacity-50 text-xs">
                            {isSyncing ? '⏳ Sinkronisasi...' : '🔄 Sinkronkan'}
                        </button>
                    </span>
                </div>
            )}

            {/* ── Page Header ─────────────────────────────────────────── */}
            {header && (
                <div className="bg-white border-b border-gray-100 py-3.5 px-4 md:px-6">
                    <div className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">{header}</div>
                </div>
            )}

            {/* ── Main Content ─────────────────────────────────────────── */}
            <main className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8">
                {children}
            </main>

            {/* ── Bottom Navigation (Figma: Beranda|Riwayat|📷 FAB|Insights|Akun) ── */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
                <div className="max-w-lg mx-auto grid grid-cols-5 h-16 relative">

                    {/* Beranda — ikon png dari Figma */}
                    <Link
                        href={route('patient.dashboard')}
                        id="nav-beranda"
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${isActive('patient.dashboard') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {/* Ikon beranda dari Figma (abu2 statis, tidak bisa ganti warna) */}
                        <img
                            src="/icons/beranda.png"
                            alt=""
                            className={`w-5 h-5 object-contain ${isActive('patient.dashboard') ? '' : 'opacity-50'}`}
                            style={isActive('patient.dashboard') ? { filter: 'invert(39%) sepia(98%) saturate(1258%) hue-rotate(196deg) brightness(96%) contrast(94%)' } : {}}
                        />
                        <span>Beranda</span>
                    </Link>

                    {/* Riwayat */}
                    <Link
                        href={route('patient.blood-sugar.trend')}
                        id="nav-riwayat"
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${isActive('patient.blood-sugar.trend') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Riwayat</span>
                    </Link>

                    {/* FAB Kamera Tengah — menggunakan kamera-putih.png dari Figma */}
                    <div className="flex items-center justify-center">
                        <Link
                            href={route('patient.nutrition.index')}
                            id="fab-scan"
                            className="w-14 h-14 rounded-full bg-[#4CAF50] shadow-lg flex items-center justify-center -mt-5 border-4 border-white hover:bg-[#43A047] transition active:scale-95"
                        >
                            <img
                                src="/icons/kamera-putih.png"
                                alt="Pindai"
                                className="w-7 h-7 object-contain"
                            />
                        </Link>
                    </div>

                    {/* Insights */}
                    <Link
                        href={route('patient.health-summary')}
                        id="nav-insights"
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${isActive('patient.health-summary') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        <span>Insights</span>
                    </Link>

                    {/* Akun */}
                    <Link
                        href={route('profile.edit')}
                        id="nav-akun"
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${isActive('profile.edit') ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span>Akun</span>
                    </Link>

                </div>
            </nav>
        </div>
    );
}
