import React from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100/80 p-0 sm:p-6 font-sans">
            <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md bg-white sm:rounded-3xl sm:shadow-2xl sm:border sm:border-gray-100 overflow-hidden px-6 py-8 flex flex-col justify-between relative">
                <img src="/icons/vektor-latar-biru.png" alt="" className="absolute -top-3 -left-4 -right-4 w-[108%] max-w-none object-cover pointer-events-none z-0 opacity-80" />
                <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -bottom-6 -left-8 -right-8 w-[115%] max-w-none object-cover pointer-events-none z-0 opacity-80" />
                <div className="relative z-10 flex flex-col justify-between flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
