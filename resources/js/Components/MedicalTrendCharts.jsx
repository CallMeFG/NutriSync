import React from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

export default function MedicalTrendCharts({ bloodSugarChartData = [], dailySugarData = [], dailyLimit = 25 }) {
    if (bloodSugarChartData.length === 0 && dailySugarData.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Tren Gula Darah */}
            {bloodSugarChartData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 text-md flex items-center gap-2">
                            <span>📈 Tren Gula Darah</span>
                        </h3>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                            {bloodSugarChartData.length} Pemeriksaan Terakhir
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={bloodSugarChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                domain={[40, 'auto']}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                unit=" mg/dL"
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                                formatter={(value) => [`${value} mg/dL`, 'Kadar Glukosa']}
                                labelStyle={{ fontWeight: 700, color: '#374151' }}
                            />
                            <ReferenceLine
                                y={126}
                                stroke="#EF4444"
                                strokeDasharray="5 5"
                                strokeWidth={1.5}
                                label={{
                                    value: 'Bahaya ≥126',
                                    position: 'insideTopRight',
                                    fontSize: 9,
                                    fill: '#EF4444',
                                    fontWeight: 700,
                                }}
                            />
                            <ReferenceLine
                                y={100}
                                stroke="#EAB308"
                                strokeDasharray="5 5"
                                strokeWidth={1.5}
                                label={{
                                    value: 'Waspada ≥100',
                                    position: 'insideTopRight',
                                    fontSize: 9,
                                    fill: '#EAB308',
                                    fontWeight: 700,
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="glucose"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                        Garis putus-putus menunjukkan ambang batas PERKENI 2024 / ADA
                    </p>
                </div>
            )}

            {/* Chart: Konsumsi Gula Harian */}
            {dailySugarData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 text-md flex items-center gap-2">
                            <span>🍬 Konsumsi Gula Harian</span>
                        </h3>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold">
                            7 Hari Terakhir
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={dailySugarData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                unit="g"
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}
                                formatter={(value, name) => {
                                    if (name === 'total_sugar') return [`${value}g`, 'Konsumsi Gula'];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => `Hari: ${label}`}
                                labelStyle={{ fontWeight: 700, color: '#374151' }}
                            />
                            <ReferenceLine
                                y={dailyLimit}
                                stroke="#EF4444"
                                strokeDasharray="5 5"
                                strokeWidth={1.5}
                                label={{
                                    value: `Batas ${dailyLimit}g`,
                                    position: 'insideTopRight',
                                    fontSize: 9,
                                    fill: '#EF4444',
                                    fontWeight: 700,
                                }}
                            />
                            <Bar
                                dataKey="total_sugar"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={44}
                            >
                                {dailySugarData.map((entry, index) => {
                                    let fill = '#22C55E'; // Aman (hijau)
                                    if (entry.total_sugar >= entry.limit) {
                                        fill = '#EF4444'; // Bahaya (merah) — melewati batas
                                    } else if (entry.total_sugar >= entry.limit * 0.7) {
                                        fill = '#EAB308'; // Waspada (kuning) — mendekati batas
                                    }
                                    return <Cell key={`cell-${index}`} fill={fill} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                        Hijau = aman · Kuning = mendekati batas · Merah = melampaui batas harian
                    </p>
                </div>
            )}
        </div>
    );
}
