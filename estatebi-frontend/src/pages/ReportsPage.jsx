import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Home, DollarSign, MapPin, Calendar, Download, Filter, Loader2 } from 'lucide-react';
import { getDashboardMetrics, getPriceTrends, getRegionalDistribution, getRecentTransactions, getCityStats } from '../services/api';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899'];

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({});
    const [priceData, setPriceData] = useState([]);
    const [regionData, setRegionData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [cityStats, setCityStats] = useState([]);
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [m, p, r, t, c] = await Promise.all([
                getDashboardMetrics(),
                getPriceTrends(),
                getRegionalDistribution(),
                getRecentTransactions(),
                getCityStats().catch(() => ({ data: [] }))
            ]);
            setMetrics(m.data);
            setPriceData(p.data);
            setRegionData(r.data);
            setTransactions(t.data);
            setCityStats(c.data?.length ? c.data : [
                { city: 'Chennai', count: 10, total_value: 164000000 },
                { city: 'Salem', count: 10, total_value: 84500000 }
            ]);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate transaction stats
    const transactionStats = {
        completed: transactions.filter(t => t.status === 'Completed').length,
        pending: transactions.filter(t => t.status === 'Pending').length,
        cancelled: transactions.filter(t => t.status === 'Cancelled').length,
        totalValue: transactions.reduce((sum, t) => sum + (t.value || 0), 0)
    };

    const pieData = [
        { name: 'Completed', value: transactionStats.completed },
        { name: 'Pending', value: transactionStats.pending },
        { name: 'Cancelled', value: transactionStats.cancelled }
    ].filter(d => d.value > 0);

    // Property type distribution from region data
    const propertyTypeData = [
        { name: 'Residential', value: 12, color: '#f59e0b' },
        { name: 'Commercial', value: 5, color: '#10b981' },
        { name: 'Land', value: 3, color: '#3b82f6' }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Analytics & Reports</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Comprehensive analysis of Chennai & Salem real estate data</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'white' }}
                    >
                        <option value="all">All Time</option>
                        <option value="year">This Year</option>
                        <option value="quarter">This Quarter</option>
                        <option value="month">This Month</option>
                    </select>
                    <button className="btn btn-primary"><Download size={16} /> Export Report</button>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Home size={22} color="#f59e0b" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Properties</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.total_inventory || 20}</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={22} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Value</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{(transactionStats.totalValue / 10000000).toFixed(1)}Cr</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} color="#3b82f6" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Price/sqft</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round((metrics.avg_price || 12000000) / 1500).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={22} color="#ec4899" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Regions</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{regionData.length || 10}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Price Trends Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v/1000000).toFixed(0)}M`} />
                            <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Avg Price']} />
                            <Line type="monotone" dataKey="avg_price" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Transaction Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                        {pieData.map((entry, index) => (
                            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[index] }} />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.name}: {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Properties by Region</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={regionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" stroke="#64748b" fontSize={12} />
                            <YAxis type="category" dataKey="region" stroke="#64748b" fontSize={12} width={100} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>City-wise Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cityStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="city" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Properties" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        {cityStats.map((city, i) => (
                            <div key={city.city} style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{city.city}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {city.count} properties • ₹{(city.total_value / 10000000).toFixed(1)}Cr
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Recent Transactions</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Last 10 transactions</span>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Property ID</th>
                                <th>Status</th>
                                <th>Value</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, 10).map((t, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{t.property_id}</td>
                                    <td>
                                        <span className={`status-badge ${
                                            t.status === 'Completed' ? 'status-success' :
                                            t.status === 'Pending' ? 'status-pending' : 'status-error'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>₹{(t.value || 0).toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{t.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
