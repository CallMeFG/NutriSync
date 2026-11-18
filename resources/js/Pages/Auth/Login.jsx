import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import TurnstileWidget from '@/Components/TurnstileWidget';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        'cf-turnstile-response': '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk — NutriSync" />

            {/* Back Button */}
            <div className="pt-2">
                <Link href="/" className="text-gray-400 hover:text-gray-700 p-2 -ml-2 inline-block transition">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            {/* Header / Welcome */}
            <div className="mt-4 mb-6">
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                    <span>Selamat Datang di</span>
                </h1>
                <div className="text-2xl font-black tracking-tight flex items-center gap-2 mt-0.5">
                    <span>
                        <span className="text-[#22C55E]">Nutri</span>
                        <span className="text-[#1E88E5]">Sync</span>
                    </span>
                    <span className="text-2xl">👋</span>
                </div>
                <p className="text-sm text-gray-500 font-normal mt-2 leading-relaxed">
                    Masuk untuk melanjutkan perjalanan sehat Anda.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 my-auto">
                {/* Email / No HP */}
                <div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <input
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email atau No. HP"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 ml-1" />
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5 ml-1" />
                </div>

                {/* Checkbox & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded-md border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                        />
                        <span className="ms-2 text-xs font-medium text-gray-600">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-bold text-[#1E88E5] hover:underline"
                        >
                            Lupa Password ?
                        </Link>
                    )}
                </div>

                {/* Cloudflare Turnstile */}
                <div className="pt-2">
                    <TurnstileWidget
                        onVerify={(token) => setData('cf-turnstile-response', token)}
                    />
                    <InputError message={errors['cf-turnstile-response']} className="mt-1" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-base shadow-lg shadow-[#1E88E5]/25 active:scale-[0.98] transition disabled:opacity-50"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </div>

                {/* Divider */}
                <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium">atau</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Register Link Button */}
                <div>
                    <Link
                        href={route('register')}
                        className="w-full py-3.5 rounded-2xl border border-[#1E88E5] text-[#1E88E5] hover:bg-blue-50/60 font-bold text-base transition flex items-center justify-center text-center block"
                    >
                        Daftar Akun Baru
                    </Link>
                </div>
            </form>

            {/* Footer Terms */}
            <div className="mt-8 text-center text-[11px] text-gray-400 leading-relaxed pb-2">
                Dengan masuk, Anda menyetujui <br />
                <a href="#" className="text-[#1E88E5] font-bold hover:underline">
                    Syarat & Ketentuan dan Kebijakan Privasi
                </a>
            </div>
        </GuestLayout>
    );
}
