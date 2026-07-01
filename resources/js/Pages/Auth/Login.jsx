import React from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import TurnstileWidget from '@/Components/TurnstileWidget';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
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
            <Head title="Masuk ke NutriSync" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Masuk untuk memantau asupan gizi & risiko diabetes
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="contoh@domain.com"
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <div className="flex justify-between items-center">
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-emerald-600 hover:text-emerald-700 underline font-medium"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                {/* Cloudflare Turnstile */}
                <TurnstileWidget
                    onVerify={(token) => setData('cf-turnstile-response', token || '')}
                />
                <InputError message={errors['cf-turnstile-response']} className="mt-1 text-center" />

                <div className="pt-2 flex flex-col gap-3">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-base shadow-md transition-all"
                        disabled={processing || !data['cf-turnstile-response']}
                    >
                        {processing ? 'Masuk...' : 'Masuk ➔'}
                    </PrimaryButton>

                    <div className="text-center text-sm text-gray-600">
                        Belum punya akun?{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
                        >
                            Daftar sekarang
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
