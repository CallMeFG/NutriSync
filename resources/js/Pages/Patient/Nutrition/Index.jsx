import React, { useEffect, useRef, useState } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';

export default function NutritionIndex({ logs, todaySugar, dailyLimit, currentStatus }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'manual'
    const [cameraError, setCameraError] = useState(null);
    const [lookupMessage, setLookupMessage] = useState(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const scannerRef = useRef(null);

    // Form setup dengan client_uuid untuk idempotency (aturan wajib #9)
    const { data, setData, post, processing, errors, reset } = useForm({
        client_uuid: crypto.randomUUID(),
        barcode: '',
        product_name: '',
        sugar_g: '',
        serving_size_g: '100',
        scanned_at: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    });

    // Inisialisasi dan cleanup Html5Qrcode Scanner (aturan wajib kamera)
    useEffect(() => {
        let html5QrCode = null;
        let isMounted = true;

        if (activeTab === 'scan') {
            setCameraError(null);
            
            // Impor dinamis untuk menghindari isu SSR/bundling di awal
            import('html5-qrcode').then(({ Html5Qrcode }) => {
                if (!isMounted) return;

                html5QrCode = new Html5Qrcode('barcode-reader');
                scannerRef.current = html5QrCode;

                // WAJIB try-catch eksplisit dan facingMode 'environment' (kamera belakang)
                try {
                    html5QrCode.start(
                        { facingMode: 'environment' },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 150 },
                            aspectRatio: 1.0,
                        },
                        (decodedText) => {
                            // Sukses membaca barcode
                            if (html5QrCode && html5QrCode.isScanning) {
                                html5QrCode.stop().catch(() => {});
                            }
                            handleBarcodeScanned(decodedText);
                        },
                        (error) => {
                            // Aturan wajib: Callback scan-gagal per-frame JANGAN memicu error/toast
                        }
                    ).catch((err) => {
                        if (isMounted) {
                            setCameraError(
                                `Kamera gagal dibuka: ${err?.message || 'Pastikan izin kamera diaktifkan dan akses menggunakan HTTPS atau localhost.'}`
                            );
                        }
                    });
                } catch (err) {
                    if (isMounted) {
                        setCameraError(
                            `Inisialisasi kamera gagal: ${err?.message || 'Perangkat tidak mendukung atau kamera sedang digunakan aplikasi lain.'}`
                        );
                    }
                }
            }).catch((err) => {
                if (isMounted) {
                    setCameraError('Gagal memuat modul scanner kamera.');
                }
            });
        }

        // WAJIB cleanup saat unmount atau pindah tab
        return () => {
            isMounted = false;
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {}).finally(() => {
                    scannerRef.current = null;
                });
            }
        };
    }, [activeTab]);

    // Handle lookup ke backend OpenFoodFacts saat barcode terbaca
    const handleBarcodeScanned = async (barcodeText) => {
        setIsLookingUp(true);
        setLookupMessage(`⏳ Mencari data nutrisi barcode: ${barcodeText}...`);
        setData('barcode', barcodeText);

        try {
            const response = await axios.get(route('patient.nutrition.lookup'), {
                params: { barcode: barcodeText },
            });

            if (response.data.found && response.data.product) {
                const p = response.data.product;
                setData((prev) => ({
                    ...prev,
                    barcode: barcodeText,
                    product_name: p.name || 'Produk Kemasan',
                    sugar_g: p.sugar_per_serving_g ? String(p.sugar_per_serving_g) : '0',
                    serving_size_g: p.serving_size_g ? String(p.serving_size_g) : '100',
                }));
                setLookupMessage(`✅ Produk ditemukan: ${p.name} (${p.sugar_per_serving_g}g gula / saji).`);
            } else {
                setData((prev) => ({
                    ...prev,
                    barcode: barcodeText,
                    product_name: '',
                    sugar_g: '',
                }));
                setLookupMessage(`⚠️ Barcode ${barcodeText} belum ada di database. Silakan lengkapi nama dan kandungan gula dari kemasan secara manual.`);
            }
        } catch (err) {
            setLookupMessage('❌ Gagal terhubung ke server lookup. Silakan input nutrisi secara manual.');
        } finally {
            setIsLookingUp(false);
            setActiveTab('manual'); // Otomatis pindah ke tab form agar user bisa review/simpan
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('patient.nutrition.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('client_uuid', crypto.randomUUID());
                setLookupMessage(null);
            },
        });
    };

    // Warna status risiko wajib (Aman: #22C55E, Waspada: #EAB308, Bahaya: #EF4444)
    const getRiskBadge = (status) => {
        if (status === 'bahaya') return { color: 'bg-[#EF4444] text-white', label: 'Bahaya (Tinggi)' };
        if (status === 'waspada') return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada (Sedang)' };
        return { color: 'bg-[#22C55E] text-white', label: 'Aman (Rendah)' };
    };

    // Kalkulasi progress konsumsi gula hari ini
    const progressPercentage = Math.min(100, Math.round((todaySugar / Math.max(1, dailyLimit)) * 100));
    const isOverLimit = todaySugar > dailyLimit;

    return (
        <PatientLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>🥑 Pindai Barcode & Nutrisi Makanan</span>
                    </h2>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('scan')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeTab === 'scan' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            📷 Pindai Barcode
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            ✍️ Input Manual
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Pindai Makanan & Gizi - Pasien" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold">
                        ✅ {flash.success}
                    </div>
                )}

                {lookupMessage && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm font-semibold flex justify-between items-center">
                        <span>{lookupMessage}</span>
                        <button type="button" onClick={() => setLookupMessage(null)} className="text-xs font-bold underline">
                            Tutup
                        </button>
                    </div>
                )}

                {/* Banner Konsumsi Hari Ini */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konsumsi Gula Hari Ini</span>
                        <span className="text-sm font-black text-gray-800">
                            <span className={isOverLimit ? 'text-red-600' : 'text-emerald-600'}>{todaySugar}g</span> / {dailyLimit}g
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${
                                isOverLimit ? 'bg-[#EF4444]' : progressPercentage >= 70 ? 'bg-[#EAB308]' : 'bg-[#22C55E]'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {isOverLimit && (
                        <p className="text-xs font-bold text-red-600 mt-2 flex items-center gap-1">
                            ⚠️ Peringatan: Konsumsi gula hari ini telah melebihi batas maksimal anjuran NutriSync!
                        </p>
                    )}
                </div>

                {/* Tab Pemindaian Barcode */}
                {activeTab === 'scan' && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center">
                        <h3 className="font-bold text-gray-800 mb-2">📷 Arahkan Kamera ke Barcode Makanan / Minuman</h3>
                        <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                            Pastikan pencahayaan cukup dan barcode berada tepat di dalam kotak pemindai.
                        </p>

                        {cameraError ? (
                            <div className="p-6 bg-red-50 border-2 border-dashed border-red-300 rounded-2xl text-red-700 text-sm max-w-md mx-auto">
                                <div className="text-2xl mb-2">🚫</div>
                                <p className="font-bold mb-1">Kamera Tidak Dapat Diakses</p>
                                <p className="text-xs opacity-90 mb-4">{cameraError}</p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('manual')}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                                >
                                    ✍️ Beralih ke Input Manual
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-sm mx-auto overflow-hidden rounded-2xl border-4 border-emerald-600 shadow-md bg-black min-h-[250px] relative">
                                <div id="barcode-reader" className="w-full h-full" />
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Form Input Manual */}
                {activeTab === 'manual' && (
                    <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-md">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>✍️ Catat Informasi Kandungan Gizi</span>
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Nomor Barcode / EAN (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        placeholder="Contoh: 8991234567890"
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 font-mono"
                                    />
                                    {errors.barcode && <p className="text-xs text-red-600 mt-1">{errors.barcode}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Nama Makanan / Minuman <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.product_name}
                                        onChange={(e) => setData('product_name', e.target.value)}
                                        placeholder="Contoh: Susu UHT Rasa Cokelat"
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.product_name && <p className="text-xs text-red-600 mt-1">{errors.product_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Gula per Takaran Saji (Gram) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="500"
                                        required
                                        value={data.sugar_g}
                                        onChange={(e) => setData('sugar_g', e.target.value)}
                                        placeholder="Contoh: 18.5"
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">Lihat pada tabel Informasi Nilai Gizi di bagian belakang kemasan.</p>
                                    {errors.sugar_g && <p className="text-xs text-red-600 mt-1">{errors.sugar_g}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Takaran Saji (Gram/Ml)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        max="2000"
                                        value={data.serving_size_g}
                                        onChange={(e) => setData('serving_size_g', e.target.value)}
                                        placeholder="Contoh: 250"
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.serving_size_g && <p className="text-xs text-red-600 mt-1">{errors.serving_size_g}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                                >
                                    {processing ? '⏳ Menyimpan...' : '💾 Simpan & Analisis Risiko'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Riwayat Pemindaian */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-md">📦 Riwayat Konsumsi & Pindai</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">
                            Total: {logs.total} Data
                        </span>
                    </div>

                    {logs.data.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-2">🥗</div>
                            <p className="font-semibold text-gray-700">Belum ada riwayat makanan</p>
                            <p className="text-xs text-gray-400 mt-1">Pindai barcode makanan kemasan atau input manual untuk memantau asupan gula Anda.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {logs.data.map((log) => {
                                const badge = getRiskBadge(log.result_status);
                                return (
                                    <div key={log.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50/50 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex flex-col items-center justify-center font-bold text-gray-700 border border-gray-200">
                                                <span className="text-sm font-black">{log.sugar_per_serving_g}g</span>
                                                <span className="text-[9px] uppercase text-gray-400 font-normal">Gula</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800 text-sm">{log.product_name}</span>
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    📅 {new Date(log.scanned_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                    {log.barcode && <span className="ml-2 font-mono text-gray-400">[{log.barcode}]</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-gray-400 self-end sm:self-center">
                                            ID: {log.client_uuid ? log.client_uuid.slice(0, 8) : 'sync'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PatientLayout>
    );
}
