import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    // 0 = Startup Logo intro (Page Startup Logo.png)
    // 1 = Splash 4: Kenali Resiko Diabetes
    // 2 = Splash 5: Pemindai Gizi
    // 3 = Splash 6: Prediksi Personal
    const [step, setStep] = useState(0);

    // If step 0 (Startup Logo)
    if (step === 0) {
        return (
            <>
                <Head title="NutriSync — Deteksi Dini Resiko Diabetes" />
                <div
                    onClick={() => setStep(1)}
                    className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:max-w-md sm:mx-auto sm:my-8 sm:min-h-[720px] sm:rounded-3xl sm:shadow-2xl sm:border sm:border-gray-100 relative overflow-hidden cursor-pointer select-none"
                >
                    {/* Top Vector Curve Background (Blue) */}
                    <img src="/icons/vektor-latar-biru.png" alt="" className="absolute -top-3 -left-4 -right-4 w-[108%] max-w-none object-cover pointer-events-none z-0" />

                    {/* Bottom Vector Curve Background (Green) */}
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -bottom-6 -left-8 -right-8 w-[115%] max-w-none object-cover pointer-events-none z-0" />

                    {/* Center Content: Logo & Subtitle */}
                    <div className="relative z-10 flex flex-col items-center text-center my-auto">
                        <div className="w-40 h-40 mb-4 flex items-center justify-center relative animate-pulse">
                            <img src="/icons/NutriSync-icon.png" alt="NutriSync Logo" className="w-36 h-36 object-contain drop-shadow-xl" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-3">
                            <span className="text-[#22C55E]">Nutri</span>
                            <span className="text-[#1E88E5]">Sync</span>
                        </h1>
                        <p className="text-sm text-gray-700 font-medium max-w-[280px] leading-relaxed">
                            Deteksi Dini Resiko Diabetes untuk Remaja & Generasi Muda Indonesia
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // Slides data exactly matching Page Splash 4, 5, 6 PNGs
    const slides = [
        {
            title: 'Kenali Resiko Diabetes',
            description: 'Membantu pengguna memahami resiko diabetes melalui prediksi AI berbasis Kesehatan & gaya hidup',
            illustration: (
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center bg-blue-50/80 rounded-full p-6 my-4">
                    {/* Glucose Meter & Heart Monitor Illustration */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-28 h-44 bg-blue-600 rounded-3xl p-3 shadow-xl border-4 border-white flex flex-col items-center justify-between">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl flex flex-col items-center justify-center p-2 border border-slate-200">
                                <span className="text-[10px] text-gray-400 font-mono">GLUCOSE</span>
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">86</span>
                                <span className="text-[9px] text-emerald-600 font-bold">mg/dL</span>
                            </div>
                            <div className="w-4 h-12 bg-red-500 rounded-b-full shadow-inner flex items-end justify-center pb-1">
                                <div className="w-2 h-2 rounded-full bg-red-300 animate-ping" />
                            </div>
                        </div>
                    </div>
                    {/* Badge left */}
                    <div className="absolute top-8 left-4 w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    {/* Badge right */}
                    <div className="absolute top-12 right-6 w-11 h-14 bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center p-1">
                        <div className="w-6 h-1.5 bg-red-500 rounded-full mb-1" />
                        <span className="text-[10px] font-black text-emerald-600">💧</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Pemindai Gizi',
            description: 'Scan barcode makanan & minuman kemasan untuk mengetahui kandungan gula dan dampaknya bagi tubuh',
            illustration: (
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center bg-emerald-50/80 rounded-full p-6 my-4">
                    {/* Barcode Scanner & Salad Bowl Illustration */}
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-40 bg-slate-800 rounded-2xl p-2 border-2 border-white shadow-xl flex flex-col items-center justify-center relative">
                            <div className="w-full h-28 bg-white rounded-lg flex flex-col items-center justify-center border border-emerald-500 relative overflow-hidden">
                                <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-bounce top-1/2" />
                                <span className="text-2xl">📱</span>
                                <span className="text-[9px] font-mono font-bold text-gray-700 mt-1">QR/CODE</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-28 h-24 bg-white rounded-2xl shadow-lg border border-emerald-100 flex flex-col items-center justify-center p-2">
                                <span className="text-3xl">🥗</span>
                                <span className="text-[10px] font-bold text-emerald-700 mt-1">Gizi Seimbang</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Prediksi Personal',
            description: 'Menganalisis banyak faktor medis untuk memberikan prediksi resiko yang personal & dinamis',
            illustration: (
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center bg-red-50/80 rounded-full p-6 my-4">
                    {/* Heart with Pulse & Caring Hands */}
                    <div className="flex flex-col items-center">
                        <div className="w-28 h-28 bg-red-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white text-white relative animate-pulse">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="w-40 h-8 bg-amber-200/90 rounded-t-full shadow-md mt-2 flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-900">🙌 Pendampingan AI</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentSlide = slides[step - 1];

    return (
        <>
            <Head title={`${currentSlide.title} — NutriSync`} />
            <div className="min-h-screen bg-white flex flex-col justify-between p-6 sm:max-w-md sm:mx-auto sm:my-8 sm:min-h-[720px] sm:rounded-3xl sm:shadow-2xl sm:border sm:border-gray-100 relative overflow-hidden">
                <img src="/icons/vektor-latar-biru.png" alt="" className="absolute -top-3 -left-4 -right-4 w-[108%] max-w-none object-cover pointer-events-none z-0 opacity-80" />
                <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -bottom-6 -left-8 -right-8 w-[115%] max-w-none object-cover pointer-events-none z-0 opacity-80" />
                <div className="relative z-10 flex flex-col justify-between flex-1">
                    {/* Top Header: Back / Skip */}
                    <div className="flex items-center justify-between pt-2">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-gray-400 hover:text-gray-700 p-2 -ml-2 transition"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => setStep(0)}
                            className="text-gray-400 hover:text-gray-700 p-2 -ml-2 transition"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {step < 3 ? (
                        <Link
                            href={route('login')}
                            className="text-sm font-bold text-gray-400 hover:text-[#1E88E5] transition py-1 px-2"
                        >
                            Lewati
                        </Link>
                    ) : (
                        <span className="w-12" />
                    )}
                </div>

                {/* Center Content */}
                <div className="flex flex-col items-center text-center my-auto">
                    {currentSlide.illustration}

                    <h2 className="text-2xl font-black text-[#0F172A] mt-6 mb-3 tracking-tight">
                        {currentSlide.title}
                    </h2>
                    <p className="text-sm text-gray-600 font-normal leading-relaxed max-w-[280px]">
                        {currentSlide.description}
                    </p>
                </div>

                {/* Bottom Section: Dots & Button */}
                <div className="w-full flex flex-col items-center pb-4 space-y-8">
                    {/* Dots indicator */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                onClick={() => setStep(s)}
                                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                                    step === s ? 'w-6 bg-[#1E88E5]' : 'w-2 bg-blue-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Action Button */}
                    <div className="w-full space-y-3">
                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="w-full py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-base shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition"
                            >
                                Selanjutnya
                            </button>
                        ) : (
                            <>
                                <Link
                                    href={route('register')}
                                    className="w-full py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-base shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition flex items-center justify-center text-center block"
                                >
                                    Selanjutnya
                                </Link>
                                <div className="text-center pt-2">
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold text-gray-500 hover:text-[#1E88E5] transition"
                                    >
                                        Sudah punya akun? <span className="text-[#1E88E5] font-bold">Masuk</span>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}
