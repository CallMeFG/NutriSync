import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import TurnstileWidget from '@/Components/TurnstileWidget';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'patient', // default 'patient'
        phone_number: '',
        'cf-turnstile-response': '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun NutriSync" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Deteksi dini risiko diabetes untuk remaja Indonesia
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Peran Anda
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setData('role', 'patient')}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 ${
                                data.role === 'patient'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                            }`}
                        >
                            <span className="text-2xl">👦</span>
                            <span className="font-bold text-sm">Pasien Remaja</span>
                            <span className="text-[11px] opacity-75">10–24 Tahun</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setData('role', 'caregiver')}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1 ${
                                data.role === 'caregiver'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                            }`}
                        >
                            <span className="text-2xl">👨‍👩‍👧</span>
                            <span className="font-bold text-sm">Orang Tua / Wali</span>
                            <span className="text-[11px] opacity-75">Pendamping</span>
                        </button>
                    </div>
                    <InputError message={errors.role} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="Masukkan nama lengkap"
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        placeholder="contoh@domain.com"
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="phone_number" value="Nomor WhatsApp (Opsional)" />
                    <TextInput
                        id="phone_number"
                        type="tel"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full rounded-xl"
                        onChange={(e) => setData('phone_number', e.target.value)}
                        placeholder="081234567890 (Untuk notifikasi darurat)"
                    />
                    <InputError message={errors.phone_number} className="mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-xl"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Konfirmasi Sandi"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full rounded-xl"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1"
                        />
                    </div>
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
                        {processing ? 'Mendaftar...' : 'Daftar Akun Sekarang ➔'}
                    </PrimaryButton>

                    <div className="text-center text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
                        >
                            Masuk di sini
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
