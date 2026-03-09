import React from 'react';
import { AreaChart as RAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300, minHeight: 300 }}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                    <RAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                        />
                        <CartesianGrid vertical={false} stroke="var(--border-color)" strokeDasharray="3 3" />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                color: 'var(--text-main)'
                            }}
                            itemStyle={{ color: 'var(--primary)' }}
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Avg Price']}
                        />
                        <Area
                            type="monotone"
                            dataKey="avg_price"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </RAreaChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No data available</div>
            )}
        </div>
    );
};

export default LineChart;
