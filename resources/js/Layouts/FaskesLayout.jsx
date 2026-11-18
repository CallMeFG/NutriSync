import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function FaskesLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
            {/* ── Top Header (sesuai Figma Faskes) ────────────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href={route('faskes.dashboard')} className="flex items-center gap-2">
                        <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="16" fill="#E8F5E9"/>
                            <path d="M20 11c-1.5 0-2.8.7-3.7 1.8C15.4 11.7 14.1 11 12.6 11 10 11 8 13 8 15.6c0 3.4 3.5 6.3 8 9.4 4.5-3.1 8-6 8-9.4C24 13 22 11 20 11z" fill="#2E7D32"/>
                        </svg>
                        <div>
                            <span className="font-bold text-base md:text-xl tracking-tight text-primary-900">NutriSync</span>
                            <div className="text-[10px] md:text-xs text-gray-500 leading-none -mt-0.5">Admin Faskes</div>
                        </div>
                    </Link>

                    {/* Desktop Nav (Muncul di layar md ke atas) */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
                        <Link href={route('faskes.dashboard')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('faskes.dashboard') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>🏥 Dashboard Epidemiologi</span>
                        </Link>
                        <Link href={route('faskes.risk-distribution')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('faskes.risk-distribution') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>🗺️ Persebaran Risiko</span>
                        </Link>
                        <Link href={route('faskes.report')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('faskes.report') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>📄 Laporan & Ekspor</span>
                        </Link>
                        <Link href={route('profile.edit')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('profile.edit') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>⚙️ Pengaturan Akun</span>
                        </Link>
                    </nav>

                    {/* Right: Notif + Avatar */}
                    <div className="flex items-center gap-3">
                        <button type="button" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <Link href={route('profile.edit')} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-700 hover:ring-2 hover:ring-primary-500 transition">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                        </Link>
                    </div>
                </div>
            </header>

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

            {/* ── Bottom Nav Faskes ─────────────────────────────────────── */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-lg">
                <div className="max-w-lg mx-auto grid grid-cols-5 h-16 relative">
                    <Link href={route('faskes.dashboard')} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${route().current('faskes.dashboard') ? 'text-primary-600' : 'text-gray-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={route().current('faskes.dashboard') ? '#1E88E5' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={route().current('faskes.dashboard') ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-5.25H9V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
                        </svg>
                        <span>Beranda</span>
                    </Link>
                    <Link href={route('faskes.dashboard')} className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Riwayat</span>
                    </Link>
                    {/* FAB Tengah */}
                    <div className="flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#4CAF50] shadow-lg flex items-center justify-center -mt-5 border-4 border-white opacity-40">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                            </svg>
                        </div>
                    </div>
                    <Link href={route('faskes.risk-distribution')} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${route().current('faskes.risk-distribution') ? 'text-primary-600' : 'text-gray-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        <span>Insights</span>
                    </Link>
                    <Link href={route('profile.edit')} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${route().current('profile.edit') ? 'text-primary-600' : 'text-gray-400'}`}>
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
