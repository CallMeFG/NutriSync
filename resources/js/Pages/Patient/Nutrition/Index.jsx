import React, { useEffect, useRef, useState } from 'react';
import PatientLayout from '@/Layouts/PatientLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import axios from 'axios';
import GlycemicImpactAnalyzer from '@/Components/GlycemicImpactAnalyzer';
import Modal from '@/Components/Modal';

export default function NutritionIndex({ logs, todaySugar = 0, dailyLimit = 25, currentStatus = 'aman' }) {
    const { flash, auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'manual' | 'history'
    const [cameraError, setCameraError] = useState(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
    const scannerRef = useRef(null);

    // State untuk Popup Hasil Scan (Page hasil scan.png) & Detail Gizi Lengkap (Page detail scan.png)
    const [scannedPopup, setScannedPopup] = useState(null); // { barcode, product_name, sugar_g, serving_size_g, found, result_status }
    const [detailModalItem, setDetailModalItem] = useState(null); // item/log untuk modal detail lengkap

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

            import('html5-qrcode').then(({ Html5Qrcode }) => {
                if (!isMounted) return;

                html5QrCode = new Html5Qrcode('barcode-reader');
                scannerRef.current = html5QrCode;

                const startCamera = (facing) => {
                    html5QrCode.start(
                        { facingMode: facing },
                        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
                        (decodedText) => {
                            if (html5QrCode && html5QrCode.isScanning) {
                                html5QrCode.stop().catch(() => {});
                            }
                            handleBarcodeScanned(decodedText);
                        },
                        () => { /* per-frame error diabaikan sesuai aturan */ }
                    ).catch((err) => {
                        if (!isMounted) return;
                        if (facing === 'environment') {
                            setCameraFacing('user');
                            setCameraError(null);
                        } else {
                            setCameraError(
                                `Kamera tidak dapat dibuka: ${err?.message || 'Pastikan izin kamera diaktifkan di browser.'}` 
                            );
                        }
                    });
                };

                try {
                    startCamera(cameraFacing);
                } catch (err) {
                    if (isMounted) {
                        setCameraError(
                            `Inisialisasi kamera gagal: ${err?.message || 'Perangkat tidak mendukung atau kamera dipakai aplikasi lain.'}`
                        );
                    }
                }
            }).catch(() => {
                if (isMounted) setCameraError('Gagal memuat modul scanner kamera.');
            });
        }

        return () => {
            isMounted = false;
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {}).finally(() => {
                    scannerRef.current = null;
                });
            }
        };
    }, [activeTab, cameraFacing]);

    // Toggle kamera depan ↔ belakang
    const toggleCamera = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {}).finally(() => {
                scannerRef.current = null;
                setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
            });
        } else {
            setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
        }
    };

    // Handle lookup ke backend OpenFoodFacts saat barcode terbaca
    const handleBarcodeScanned = async (barcodeText) => {
        setIsLookingUp(true);
        setData('barcode', barcodeText);

        try {
            const response = await axios.get(route('patient.nutrition.lookup'), {
                params: { barcode: barcodeText },
            });

            if (response.data.found && response.data.product) {
                const p = response.data.product;
                const sugarVal = p.sugar_per_serving_g ? Number(p.sugar_per_serving_g) : 0;
                let status = 'aman';
                if (sugarVal >= 25 || sugarVal > dailyLimit) status = 'bahaya';
                else if (sugarVal >= 15 || sugarVal > dailyLimit * 0.6) status = 'waspada';

                const popupInfo = {
                    barcode: barcodeText,
                    product_name: p.name || 'Produk Kemasan',
                    sugar_g: String(sugarVal),
                    serving_size_g: p.serving_size_g ? String(p.serving_size_g) : '100',
                    found: true,
                    result_status: status,
                };

                setData((prev) => ({
                    ...prev,
                    barcode: barcodeText,
                    product_name: popupInfo.product_name,
                    sugar_g: popupInfo.sugar_g,
                    serving_size_g: popupInfo.serving_size_g,
                }));

                setScannedPopup(popupInfo);
            } else {
                const popupInfo = {
                    barcode: barcodeText,
                    product_name: '',
                    sugar_g: '',
                    serving_size_g: '100',
                    found: false,
                    result_status: 'aman',
                };
                setData((prev) => ({
                    ...prev,
                    barcode: barcodeText,
                    product_name: '',
                    sugar_g: '',
                }));
                setScannedPopup(popupInfo);
            }
        } catch (err) {
            // Fallback jika API gangguan
            setScannedPopup({
                barcode: barcodeText,
                product_name: '',
                sugar_g: '',
                serving_size_g: '100',
                found: false,
                error: true,
                result_status: 'aman',
            });
        } finally {
            setIsLookingUp(false);
        }
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        post(route('patient.nutrition.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('client_uuid', crypto.randomUUID());
                setScannedPopup(null);
                setActiveTab('history');
            },
        });
    };

    // Warna status risiko wajib (Aman: #22C55E, Waspada: #EAB308, Bahaya: #EF4444)
    const getRiskBadge = (status) => {
        if (status === 'bahaya') return { color: 'bg-[#EF4444] text-white', label: 'Bahaya (Melampaui Batas)' };
        if (status === 'waspada') return { color: 'bg-[#EAB308] text-gray-900', label: 'Waspada (Mendekati Batas)' };
        return { color: 'bg-[#22C55E] text-white', label: 'Aman (Terkendali)' };
    };

    const progressPercentage = Math.min(100, Math.round((todaySugar / Math.max(1, dailyLimit)) * 100));
    const isOverLimit = todaySugar > dailyLimit;

    return (
        <PatientLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>🥑 Pemindai & Analisis Gizi</span>
                        </h2>
                        <p className="text-xs text-gray-500">Pindai barcode kemasan atau catat asupan gulamu</p>
                    </div>

                    <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('scan')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'scan' ? 'bg-white text-[#1E88E5] shadow-xs' : 'text-gray-600 hover:text-slate-900'
                            }`}
                        >
                            <span>📷 Scan Barcode</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'manual' ? 'bg-white text-[#22C55E] shadow-xs' : 'text-gray-600 hover:text-slate-900'
                            }`}
                        >
                            <span>✍️ Input Manual</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-600 hover:text-slate-900'
                            }`}
                        >
                            <span>📋 Riwayat ({logs?.total || 0})</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Pemindai Gizi & Barcode — NutriSync" />

            <div className="space-y-6 pb-20">
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-xs">
                        <span>✅</span>
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Banner Konsumsi Hari Ini */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <img src="/icons/vektor-latar-hijau.png" alt="" className="absolute -right-4 -bottom-6 w-32 opacity-15 select-none pointer-events-none" />
                    <div className="flex justify-between items-center mb-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <img src="/icons/makanan.png" alt="" className="w-5 h-5 object-contain" />
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Konsumsi Gula Hari Ini</span>
                        </div>
                        <span className="text-sm font-black text-slate-800">
                            <span className={isOverLimit ? 'text-red-600 font-extrabold' : 'text-[#22C55E]'}>{todaySugar}g</span> / {dailyLimit}g
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden relative z-10 p-0.5">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isOverLimit ? 'bg-[#EF4444]' : progressPercentage >= 70 ? 'bg-[#EAB308]' : 'bg-[#22C55E]'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {isOverLimit && (
                        <p className="text-xs font-bold text-red-600 mt-2 flex items-center gap-1.5 relative z-10">
                            <span>⚠️</span>
                            <span>Peringatan: Konsumsi gula hari ini telah melebihi batas maksimal anjuran medis NutriSync!</span>
                        </p>
                    )}
                </div>

                {/* ── Page 1: Kamera Scanner (Page Scan barcode.png) ──────── */}
                {activeTab === 'scan' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
                        <div className="max-w-md mx-auto">
                            <h3 className="font-black text-slate-900 text-base mb-1">📷 Pindai Barcode Produk Makanan/Minuman</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Arahkan kamera HP atau laptop ke barcode EAN pada kemasan produk untuk menganalisis kandungan gula secara instan.
                            </p>
                        </div>

                        {/* Indikator & Tombol Toggle Kamera */}
                        <div className="flex justify-center items-center gap-2">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                                {cameraFacing === 'environment' ? '📸 Kamera Belakang (HP)' : '🖥️ Kamera Depan (Selfie/Laptop)'}
                            </span>
                            <button
                                type="button"
                                onClick={toggleCamera}
                                className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1E88E5] border border-blue-200 transition flex items-center gap-1"
                            >
                                🔄 Ganti Kamera
                            </button>
                        </div>

                        {cameraError ? (
                            <div className="p-6 bg-red-50 border-2 border-dashed border-red-300 rounded-3xl text-red-700 text-sm max-w-md mx-auto space-y-3">
                                <div className="text-3xl">🚫</div>
                                <div className="font-black">Kamera Tidak Dapat Diakses</div>
                                <p className="text-xs opacity-90">{cameraError}</p>
                                <div className="flex gap-2 justify-center pt-2">
                                    <button
                                        type="button"
                                        onClick={toggleCamera}
                                        className="px-4 py-2 bg-[#1E88E5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                                    >
                                        🔄 Coba Kamera Lain
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('manual')}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
                                    >
                                        ✍️ Input Manual
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-sm mx-auto overflow-hidden rounded-3xl border-4 border-[#1E88E5] shadow-lg bg-black min-h-[260px] relative">
                                <div id="barcode-reader" className="w-full h-full" />
                                {isLookingUp && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#22C55E] border-t-transparent mb-3" />
                                        <p className="font-bold text-sm">Mencari Data Gizi...</p>
                                        <p className="text-xs opacity-80 mt-1 font-mono">{data.barcode}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('manual')}
                                className="text-xs font-bold text-gray-500 hover:text-slate-900 underline"
                            >
                                Barcode rusak atau tidak terbaca? Klik di sini untuk input manual →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Page 2: Form Input Manual (Fallback & Edit) ─────────── */}
                {activeTab === 'manual' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <span>✍️ Catat Informasi Kandungan Gizi</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">Isi data berdasarkan tabel Informasi Nilai Gizi di belakang kemasan.</p>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
                                <p className="mb-1">❌ Gagal Menyimpan Data:</p>
                                <ul className="list-disc list-inside font-normal space-y-0.5">
                                    {Object.entries(errors).map(([field, msg]) => (
                                        <li key={field}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Nomor Barcode / EAN (Opsional)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (data.barcode) handleBarcodeScanned(data.barcode);
                                                }
                                            }}
                                            placeholder="Contoh: 8886008101091"
                                            className="flex-1 rounded-xl border-gray-300 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5] font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleBarcodeScanned(data.barcode)}
                                            disabled={!data.barcode || isLookingUp}
                                            className="px-4 py-2 bg-[#1E88E5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {isLookingUp ? '⏳ Mencari...' : '🔍 Cari'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Nama Makanan / Minuman <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.product_name}
                                        onChange={(e) => setData('product_name', e.target.value)}
                                        placeholder="Contoh: Susu UHT Rasa Cokelat"
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
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
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">Lihat pada tabel Informasi Nilai Gizi di kemasan.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
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
                                        className="w-full rounded-xl border-gray-300 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                                    />
                                </div>
                            </div>

                            {/* Live AI Glycemic Impact & MET Activity Analyzer */}
                            <div className="pt-2">
                                <GlycemicImpactAnalyzer
                                    sugarG={data.sugar_g}
                                    weightKg={auth?.user?.patient?.weight_kg || 55}
                                    dailyLimitG={dailyLimit}
                                    productName={data.product_name || 'Produk Pilihan'}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] shadow-md transition disabled:opacity-50"
                                >
                                    {processing ? '⏳ Menyimpan...' : '💾 Simpan & Rekam Riwayat'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Page 4: Riwayat Scan Permanen (Page riwayat Scan.png) ── */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-slate-900 text-base">📦 Riwayat Konsumsi & Pemindai</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Semua data gizi dan barcode yang telah disimpan</p>
                            </div>
                            <span className="text-xs bg-white border border-gray-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl shadow-xs">
                                Total: {logs?.total || 0} Data
                            </span>
                        </div>

                        {(!logs?.data || logs.data.length === 0) ? (
                            <div className="p-16 text-center text-gray-500 space-y-3">
                                <img src="/icons/makanan.png" alt="" className="w-16 h-16 object-contain mx-auto opacity-70" />
                                <div>
                                    <p className="font-black text-slate-800 text-base">Belum Ada Riwayat Pemindaian</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Pindai barcode makanan kemasan atau input manual untuk memantau asupan gula dan dampaknya pada tubuhmu.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('scan')}
                                    className="px-5 py-2.5 bg-[#1E88E5] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition inline-block mt-2"
                                >
                                    📷 Mulai Pindai Barcode →
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {logs.data.map((log) => {
                                    const badge = getRiskBadge(log.result_status);
                                    return (
                                        <div key={log.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/60 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 flex flex-col items-center justify-center font-bold text-slate-800 border border-gray-200/80 flex-shrink-0">
                                                    <span className="text-base font-black leading-none">{log.sugar_per_serving_g}g</span>
                                                    <span className="text-[9px] uppercase text-gray-500 font-semibold mt-0.5">Gula</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-black text-slate-900 text-sm">{log.product_name || 'Produk Kemasan'}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                        <span>📅 {new Date(log.scanned_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}</span>
                                                        {log.barcode && <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">[{log.barcode}]</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailModalItem(log)}
                                                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#22C55E] text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                                                >
                                                    <span>🔍 Detail & Analisis AI</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Page 2 Popup: Modal Hasil Scan (Page hasil scan.png) ─────── */}
            <Modal show={!!scannedPopup} onClose={() => setScannedPopup(null)} maxWidth="md">
                {scannedPopup && (
                    <div className="p-6 text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E88E5] mx-auto flex items-center justify-center text-3xl shadow-xs">
                            {scannedPopup.found ? '🎉' : '⚠️'}
                        </div>

                        <div>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                getRiskBadge(scannedPopup.result_status).color
                            }`}>
                                {getRiskBadge(scannedPopup.result_status).label}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">
                                {scannedPopup.found ? scannedPopup.product_name : 'Produk Belum Terdaftar'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 font-mono">Barcode EAN: {scannedPopup.barcode}</p>
                        </div>

                        {scannedPopup.found ? (
                            <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 text-left space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-semibold">Kandungan Gula per Saji:</span>
                                    <span className="text-base font-black text-slate-900">{scannedPopup.sugar_g} gram</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-semibold">Takaran Saji:</span>
                                    <span className="text-sm font-bold text-slate-700">{scannedPopup.serving_size_g} g/ml</span>
                                </div>
                                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/80">
                                    Analisis glikemik dan kompensasi durasi olahraga akan dihitung berdasarkan berat badanmu.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
                                Barcode ini belum ada dalam database global OpenFoodFacts kami. Silakan klik tombol di bawah untuk melengkapi nama dan kandungan gula secara manual.
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                            {scannedPopup.found ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const itemToDetail = {
                                                id: 'temp-' + Date.now(),
                                                barcode: scannedPopup.barcode,
                                                product_name: scannedPopup.product_name,
                                                sugar_per_serving_g: scannedPopup.sugar_g,
                                                scanned_at: new Date().toISOString(),
                                                result_status: scannedPopup.result_status
                                            };
                                            setScannedPopup(null);
                                            setDetailModalItem(itemToDetail);
                                        }}
                                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
                                    >
                                        🔍 Detail Analisis Lengkap
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                                    >
                                        💾 Simpan ke Riwayat
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScannedPopup(null);
                                        setActiveTab('manual');
                                    }}
                                    className="w-full px-4 py-3 bg-[#1E88E5] text-white font-bold rounded-xl text-xs shadow-md transition"
                                >
                                    ✍️ Lengkapi Data Manual Sekarang
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Page 3 Modal: Detail Gizi Lengkap (Page detail scan.png) ──── */}
            <Modal show={!!detailModalItem} onClose={() => setDetailModalItem(null)} maxWidth="lg">
                {detailModalItem && (
                    <div className="p-6 space-y-5">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                            <div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                    getRiskBadge(detailModalItem.result_status).color
                                }`}>
                                    {getRiskBadge(detailModalItem.result_status).label}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-2">{detailModalItem.product_name || 'Produk Kemasan'}</h3>
                                {detailModalItem.barcode && (
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">EAN: {detailModalItem.barcode}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModalItem(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modul Analyzer & MET Activity */}
                        <div className="max-h-[70vh] overflow-y-auto pr-1">
                            <GlycemicImpactAnalyzer
                                sugarG={detailModalItem.sugar_per_serving_g || detailModalItem.sugar_g || 0}
                                weightKg={auth?.user?.patient?.weight_kg || 55}
                                dailyLimitG={dailyLimit}
                                productName={detailModalItem.product_name}
                            />
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDetailModalItem(null)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
                            >
                                Selesai & Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </PatientLayout>
    );
}
