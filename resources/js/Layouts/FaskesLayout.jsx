import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function FaskesLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            {/* Top Navigation */}
            <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('faskes.dashboard')} className="flex items-center gap-2">
                            <span className="text-2xl">🏥</span>
                            <span className="font-bold text-xl tracking-tight text-white">
                                NutriSync Faskes
                            </span>
                        </Link>
                        <span className="hidden sm:inline-block text-xs bg-indigo-500 text-white font-semibold px-2.5 py-0.5 rounded-full">
                            Admin Klinis
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold">{user.name}</div>
                            <div className="text-xs text-slate-400">Petugas Kesehatan</div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow hover:bg-indigo-700 transition"
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Header */}
            {header && (
                <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
                    <div className="max-w-7xl mx-auto">{header}</div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
