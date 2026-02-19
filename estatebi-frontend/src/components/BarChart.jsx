import React from 'react';
import { BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 300 }}>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </RBarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No data available</div>
            )}
        </div>
    );
};

export default BarChart;
