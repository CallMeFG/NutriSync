import React from 'react';

/**
 * GaugeSpeedometer
 * Komponen SVG gauge setengah lingkaran (merah-kuning-hijau) sesuai desain Figma NutriSync.
 * Digunakan di Dashboard Pasien, Ringkasan Kesehatan, dan Detail Anak Caregiver.
 *
 * Props:
 *   status: 'aman' | 'waspada' | 'bahaya'
 *   size: number (default 120) — lebar komponen
 */
export default function GaugeSpeedometer({ status = 'aman', size = 120 }) {
    // Sudut jarum: -90° (kiri, bahaya), 0° (tengah, waspada), +90° (kanan, aman)
    const angleMap = {
        bahaya:  -68,
        waspada:  0,
        aman:    68,
    };
    const angle = angleMap[status] ?? 68;

    const labelMap = {
        aman:    'Resiko Rendah',
        waspada: 'Resiko Sedang',
        bahaya:  'Resiko Tinggi',
    };
    const label = labelMap[status] ?? 'Resiko Rendah';

    // cx, cy pusat gauge (setengah lingkaran), r jari-jari
    const cx = size / 2;
    const cy = size * 0.62; // sedikit di bawah tengah agar setengah lingkaran muat
    const r  = size * 0.42;
    const strokeW = size * 0.10;

    // Helper: arc path (bagian dari lingkaran dari startAngle ke endAngle derajat)
    const polarToXY = (angleDeg, radius) => {
        const rad = ((angleDeg - 90) * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad),
        };
    };

    const arcPath = (startDeg, endDeg, radius) => {
        const s = polarToXY(startDeg, radius);
        const e = polarToXY(endDeg, radius);
        const large = endDeg - startDeg > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
    };

    // Segmen arc (setengah lingkaran: 180° → dari 180° ke 360°/0°)
    const segStart = 180;
    const segEnd   = 360;
    const third    = (segEnd - segStart) / 3; // 60° per segmen

    // Jarum: panjang jarum sebagai % dari r
    const needleLen = r * 0.82;
    const needleAngleDeg = segStart + (segEnd - segStart) / 2 + angle; // 270 + offset
    const needleTip = polarToXY(needleAngleDeg, needleLen);
    const needleBase1 = polarToXY(needleAngleDeg + 90, size * 0.025);
    const needleBase2 = polarToXY(needleAngleDeg - 90, size * 0.025);

    const valueMap = { aman: 20, waspada: 50, bahaya: 80 };
    const valueNow = valueMap[status] ?? 20;

    return (
        <div
            className="flex flex-col items-center"
            style={{ width: size }}
            role="meter"
            aria-valuenow={valueNow}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuetext={label}
            aria-label={`Status Risiko Diabetes: ${label}`}
        >
            <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${cy + strokeW / 2 + 4}`} aria-hidden="true">
                <title>Speedometer Risiko: {label}</title>
                {/* Segmen Merah (Bahaya) */}
                <path
                    d={arcPath(segStart, segStart + third, r)}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />
                {/* Segmen Kuning (Waspada) */}
                <path
                    d={arcPath(segStart + third, segStart + third * 2, r)}
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />
                {/* Segmen Hijau (Aman) */}
                <path
                    d={arcPath(segStart + third * 2, segEnd, r)}
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                />
                {/* Jarum */}
                <polygon
                    points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
                    fill="#1E293B"
                />
                {/* Lingkaran pivot jarum */}
                <circle cx={cx} cy={cy} r={size * 0.04} fill="#1E293B" />
            </svg>
            {/* Label status di bawah gauge */}
            <span className="text-[10px] font-bold text-gray-500 -mt-1">{label}</span>
        </div>
    );
}
