import React, { useMemo } from 'react';

/**
 * GlycemicImpactAnalyzer
 * 
 * Inovasi Pukau NutriSync:
 * 1. Glycemic Spike Simulator: Prediksi kurva lonjakan gula darah 120 menit pasca-konsumsi
 * 2. Sugar-Burner MET Engine: Translasi beban kalori gula ke durasi olahraga remaja (MET WHO/ACSM)
 * 3. Smart Swap Lokal: Rekomendasi jajanan sehat lokal pengganti
 */
export default function GlycemicImpactAnalyzer({
    sugarG = 0,
    weightKg = 55,
    dailyLimitG = 25,
    productName = 'Produk Pilihan',
}) {
    const numericSugar = parseFloat(sugarG) || 0;
    const numericWeight = Math.max(25, parseFloat(weightKg) || 55);
    const numericLimit = Math.max(5, parseFloat(dailyLimitG) || 25);

    // Jika belum ada gula diisi, tampilkan placeholder edukatif ramah remaja
    if (numericSugar <= 0) {
        return (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 text-gray-600 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">AI Glycemic & MET Activity Simulator</p>
                        <p className="opacity-90 mt-0.5">
                            Pindai barcode atau ketik kandungan gula produk untuk melihat simulasi kurva lonjakan glukosa darah 2 jam ke depan & waktu olahraga pembakarannya.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 1. Kalkulasi Glycemic Spike Simulator (Prediksi Kurva 120 Menit)
    const spikeAnalysis = useMemo(() => {
        const baselineGlucose = 90; // mg/dL puasa normal remaja
        // Estimasi lonjakan mg/dL berbanding lurus dengan kandungan gula dan berbanding terbalik dengan berat badan
        const peakSpikeDelta = Math.round((numericSugar * 75) / numericWeight);
        const peakGlucose = baselineGlucose + peakSpikeDelta;

        // Tentukan zona medis sesuai standar PERKENI 2024 / ADA (config nutrisync)
        let status = 'aman';
        let badgeColor = 'bg-[#22C55E] text-white';
        let borderColor = 'border-[#22C55E]';
        let statusTitle = 'Aman (Lonjakan Terkendali)';

        if (peakGlucose >= 126) {
            status = 'bahaya';
            badgeColor = 'bg-[#EF4444] text-white';
            borderColor = 'border-[#EF4444]';
            statusTitle = 'Bahaya (Lonjakan Sangat Tinggi!)';
        } else if (peakGlucose >= 100) {
            status = 'waspada';
            badgeColor = 'bg-[#EAB308] text-gray-900';
            borderColor = 'border-[#EAB308]';
            statusTitle = 'Waspada (Lonjakan Sedang)';
        }

        // Titik kurva 120 menit (SVG mini chart points)
        // Koordinat SVG: width 280, height 90
        const y0 = 70; // baseline Y
        const yPeak = Math.max(10, 70 - Math.min(60, peakSpikeDelta * 1.1));
        const y30 = y0 - (y0 - yPeak) * 0.75;
        const y60 = y0 - (y0 - yPeak) * 0.6;
        const y120 = y0 - (y0 - yPeak) * 0.2;

        const pathD = `M 10 ${y0} Q 65 ${y30} 110 ${yPeak} T 195 ${y60} T 270 ${y120}`;

        return {
            baselineGlucose,
            peakGlucose,
            peakSpikeDelta,
            status,
            badgeColor,
            borderColor,
            statusTitle,
            pathD,
            yPeak,
        };
    }, [numericSugar, numericWeight]);

    // 2. Kalkulasi Sugar-Burner MET Engine (WHO / ACSM Formula)
    const metEngine = useMemo(() => {
        // 1 gram gula = 3.87 kkal
        const totalKcal = Math.round(numericSugar * 3.87);
        // Kalori per menit = (MET * 3.5 * BeratKg) / 200
        const calcMin = (met) => {
            const kcalPerMin = (met * 3.5 * numericWeight) / 200;
            return Math.ceil(totalKcal / Math.max(1, kcalPerMin));
        };

        return {
            totalKcal,
            badmintonMin: calcMin(7.0), // Badminton / Futsal (MET 7.0)
            joggingMin: calcMin(8.0),   // Jogging santai (MET 8.0)
            walkingMin: calcMin(4.3),   // Jalan cepat ke sekolah (MET 4.3)
        };
    }, [numericSugar, numericWeight]);

    // 3. Smart Swap Lokal
    const isHighSugar = numericSugar > numericLimit * 0.5;

    return (
        <div className={`rounded-2xl border-2 ${spikeAnalysis.borderColor} bg-white shadow-md overflow-hidden transition-all duration-300`}>
            {/* Header Simulator */}
            <div className="bg-gray-900 text-white px-5 py-3.5 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <div>
                        <h4 className="font-bold text-sm tracking-wide">AI Glycemic & MET Impact Simulator</h4>
                        <p className="text-[10px] text-gray-300">
                            Estimasi respons klinis untuk remaja (BB: {numericWeight} kg)
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${spikeAnalysis.badgeColor} shadow-xs`}>
                    {spikeAnalysis.statusTitle}
                </span>
            </div>

            <div className="p-5 space-y-5">
                {/* Modul 1: Kurva Prediksi Lonjakan Gula Darah 120 Menit */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Prediksi Puncak Gula Darah (Postprandial 45')
                            </p>
                            <p className="text-2xl font-black text-gray-900 mt-0.5">
                                ~{spikeAnalysis.peakGlucose} <span className="text-xs font-bold text-gray-500">mg/dL</span>
                                <span className="text-xs font-semibold text-gray-500 ml-2">
                                    (+{spikeAnalysis.peakSpikeDelta} mg/dL dari puasa)
                                </span>
                            </p>
                        </div>
                        <div className="text-right text-[11px] text-gray-500 font-mono">
                            <div>0' → 45' → 120'</div>
                            <div>Kurva 2 Jam</div>
                        </div>
                    </div>

                    {/* SVG Curve Visualization */}
                    <div className="w-full h-24 relative overflow-hidden bg-white rounded-lg border border-gray-200 px-2 pt-2">
                        <svg viewBox="0 0 280 90" className="w-full h-full overflow-visible">
                            {/* Garis Batas Bahaya (126 mg/dL) */}
                            <line x1="10" y1="28" x2="270" y2="28" stroke="#EF4444" strokeDasharray="3,3" strokeWidth="1" />
                            <text x="14" y="23" fill="#EF4444" fontSize="8" fontWeight="bold">Batas Bahaya (126 mg/dL)</text>

                            {/* Garis Batas Waspada (100 mg/dL) */}
                            <line x1="10" y1="52" x2="270" y2="52" stroke="#EAB308" strokeDasharray="3,3" strokeWidth="1" />
                            <text x="14" y="47" fill="#CA8A04" fontSize="8" fontWeight="bold">Batas Waspada (100 mg/dL)</text>

                            {/* Kurva Glukosa */}
                            <path
                                d={spikeAnalysis.pathD}
                                fill="none"
                                stroke={
                                    spikeAnalysis.status === 'bahaya' ? '#EF4444' :
                                    spikeAnalysis.status === 'waspada' ? '#EAB308' : '#22C55E'
                                }
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />

                            {/* Titik Puncak */}
                            <circle
                                cx="110"
                                cy={spikeAnalysis.yPeak}
                                r="4.5"
                                fill={
                                    spikeAnalysis.status === 'bahaya' ? '#EF4444' :
                                    spikeAnalysis.status === 'waspada' ? '#EAB308' : '#22C55E'
                                }
                            />
                        </svg>
                    </div>
                </div>

                {/* Modul 2: Sugar-Burner MET Engine */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span>🔥 Kompensasi Aktivitas Fisik Remaja</span>
                        </p>
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                            {numericSugar}g Gula ({metEngine.totalKcal} kkal)
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center flex flex-col justify-between">
                            <span className="text-xl mb-1">🏸</span>
                            <div>
                                <p className="text-[11px] font-bold text-gray-800 leading-tight">Badminton / Futsal</p>
                                <p className="text-sm font-black text-emerald-700 mt-1">{metEngine.badmintonMin} Menit</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center flex flex-col justify-between">
                            <span className="text-xl mb-1">🏃</span>
                            <div>
                                <p className="text-[11px] font-bold text-gray-800 leading-tight">Jogging Santai</p>
                                <p className="text-sm font-black text-blue-700 mt-1">{metEngine.joggingMin} Menit</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center flex flex-col justify-between">
                            <span className="text-xl mb-1">🚶</span>
                            <div>
                                <p className="text-[11px] font-bold text-gray-800 leading-tight">Jalan Kaki Cepat</p>
                                <p className="text-sm font-black text-amber-800 mt-1">{metEngine.walkingMin} Menit</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modul 3: Smart Swap Lokal (Muncul jika gula tinggi) */}
                {isHighSugar && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 flex items-start gap-3">
                        <span className="text-xl">💡</span>
                        <div className="text-xs text-gray-800">
                            <p className="font-bold text-amber-900">Rekomendasi Smart Swap Lokal:</p>
                            <p className="mt-0.5 leading-relaxed">
                                Beban gula produk ini tinggi (<b>{numericSugar}g</b>). Alternatif lebih sehat: ganti dengan <b>Air Kelapa Muda Asli</b> atau <b>Teh Tawar Dingin</b> (≤4g gula) untuk menghemat <b>{(numericSugar - 4).toFixed(1)}g gula</b>!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
