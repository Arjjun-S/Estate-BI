import React from 'react';
import { BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="region"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--bg-color)', opacity: 0.4 }}
                            contentStyle={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                color: 'var(--text-main)'
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--primary)"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                        />
                    </RBarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No data available</div>
            )}
        </div>
    );
};

export default BarChart;
