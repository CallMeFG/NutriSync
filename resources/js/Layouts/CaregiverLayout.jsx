import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function CaregiverLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
            {/* ── Top Header (sesuai Figma Family Sync) ───────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo + label */}
                    <Link href={route('caregiver.dashboard')} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center p-1 border border-[#A5D6A7]">
                            <img src="/icons/pelindung.png" alt="NutriSync" className="w-5 h-5 object-contain" />
                        </div>
                        <div>
                            <span className="font-bold text-base md:text-xl tracking-tight text-primary-900">NutriSync</span>
                            <div className="text-[10px] md:text-xs text-[#2E7D32] font-semibold leading-none -mt-0.5">Portal Orang Tua</div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
                        <Link href={route('caregiver.dashboard')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('caregiver.dashboard') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <img src="/icons/beranda.png" alt="" className={`w-4 h-4 object-contain ${route().current('caregiver.dashboard') ? '' : 'filter invert opacity-60'}`} />
                            <span>Beranda Keluarga</span>
                        </Link>
                        <Link href={route('pairing.show')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('pairing.show') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <img src="/icons/pelindung.png" alt="" className="w-4 h-4 object-contain" />
                            <span>Hubungkan Anak</span>
                        </Link>
                        <Link href={route('profile.edit')} className={`hover:text-primary-600 transition flex items-center gap-1.5 py-1 ${route().current('profile.edit') ? 'text-primary-600 font-bold border-b-2 border-primary-600' : ''}`}>
                            <span>⚙️ Pengaturan Akun</span>
                        </Link>
                    </nav>

                    {/* Right: Notif + Avatar */}
                    <div className="flex items-center gap-3">
                        <button type="button" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                            <img src="/icons/lonceng.png" alt="Notifikasi" className="w-4 h-4 object-contain opacity-70" />
                        </button>
                        <Link href={route('profile.edit')} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-100 border border-primary-300 flex items-center justify-center overflow-hidden text-sm font-bold text-primary-800 hover:ring-2 hover:ring-primary-500 transition shadow-xs">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Page Header ─────────────────────────────────────────── */}
            {header && (
                <div className="bg-white border-b border-gray-100 py-3.5 px-4 md:px-6 shadow-xs">
                    <div className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">{header}</div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────── */}
            <main className="max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8">
                {children}
            </main>

            {/* ── Bottom Nav (Orang Tua: Beranda | Hubungkan | FAB Pantau | Insights | Akun) ── */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-lg">
                <div className="max-w-lg mx-auto grid grid-cols-5 h-16 relative">
                    {/* Beranda */}
                    <Link href={route('caregiver.dashboard')} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${route().current('caregiver.dashboard') ? 'text-primary-600' : 'text-gray-400'}`}>
                        <img src="/icons/beranda.png" alt="" className={`w-5 h-5 object-contain ${route().current('caregiver.dashboard') ? '' : 'filter invert opacity-50'}`} />
                        <span>Beranda</span>
                    </Link>
                    {/* Hubungkan */}
                    <Link href={route('pairing.show')} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${route().current('pairing.show') ? 'text-primary-600' : 'text-gray-400'}`}>
                        <img src="/icons/pelindung.png" alt="" className={`w-5 h-5 object-contain ${route().current('pairing.show') ? '' : 'opacity-60'}`} />
                        <span>Hubungkan</span>
                    </Link>
                    {/* FAB Tengah (Pantau / Tambah Anak) */}
                    <div className="flex items-center justify-center">
                        <Link href={route('pairing.show')} className="w-14 h-14 rounded-full bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg flex items-center justify-center -mt-5 border-4 border-white transition transform active:scale-95">
                            <img src="/icons/family.png" alt="Family" className="w-7 h-7 object-contain brightness-200" />
                        </Link>
                    </div>
                    {/* Insights */}
                    <Link href={route('caregiver.dashboard')} className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400 hover:text-gray-600">
                        <span className="text-base leading-none">📊</span>
                        <span>Pantauan</span>
                    </Link>
                    {/* Akun */}
                    <Link href={route('profile.edit')} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition ${route().current('profile.edit') ? 'text-primary-600' : 'text-gray-400'}`}>
                        <span className="text-base leading-none">⚙️</span>
                        <span>Akun</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
