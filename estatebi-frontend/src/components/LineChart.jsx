import React from 'react';
import { AreaChart as RAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                        <Tooltip
                            contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#1e293b' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Avg Price']}
                        />
                        <Area type="monotone" dataKey="avg_price" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </RAreaChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No data available</div>
            )}
        </div>
    );
};

export default LineChart;
