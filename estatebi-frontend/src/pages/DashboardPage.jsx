import React, { useEffect, useState } from 'react';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import { getDashboardMetrics, getPriceTrends, getRegionalDistribution, getRecentTransactions } from '../services/api';
import { Package, TrendingUp, Home, Clock, Upload, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardPage = () => {
    const [metrics, setMetrics] = useState({
        total_inventory: 0,
        avg_price: 0,
        occupancy_rate: 0,
        pending_sales: 0
    });
    const [priceData, setPriceData] = useState([]);
    const [regionData, setRegionData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [m, p, r, t] = await Promise.all([
                    getDashboardMetrics(),
                    getPriceTrends(),
                    getRegionalDistribution(),
                    getRecentTransactions()
                ]);
                setMetrics(m.data);
                setPriceData(p.data);
                setRegionData(r.data);
                setTransactions(t.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="dashboard-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>System Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Real-time business intelligence for Housing Data Warehouse V3.0</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline"><Upload size={16} /> Export CSV</button>
                    <button className="btn btn-primary"><Upload size={16} /> New Import</button>
                </div>
            </div>

            <div className="metrics-grid">
                <MetricCard
                    title="Total Inventory"
                    value={metrics.total_inventory.toLocaleString()}
                    icon={<Package size={24} color="white" />}
                    trend="+2.4%"
                    color="var(--primary)"
                    sub="Updated 2m ago"
                />
                <MetricCard
                    title="Avg Market Price"
                    value={`$${metrics.avg_price.toLocaleString()}`}
                    icon={<TrendingUp size={24} color="#f59e0b" />}
                    trend="-0.8%"
                    trendColor="red"
                    bgIcon="#fff"
                    color="#fff"
                    sub="Active Listings Only"
                    textColor="var(--text-main)"
                />
                <MetricCard
                    title="Occupancy Rate"
                    value={`${(metrics.occupancy_rate * 100).toFixed(1)}%`}
                    icon={<Home size={24} color="#10b981" />}
                    trend="94.2%"
                    trendColor="green"
                    bgIcon="#fff"
                    color="#fff"
                    sub="Across All Regions"
                    textColor="var(--text-main)"
                />
                <MetricCard
                    title="Pending Sales"
                    value={metrics.pending_sales}
                    icon={<Clock size={24} color="#f59e0b" />}
                    trend="+12"
                    trendColor="green"
                    bgIcon="#fff"
                    color="#fff"
                    sub="Transactions in Escrow"
                    textColor="var(--text-main)"
                />
            </div>

            <div className="charts-grid">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3>Price Trends Over Time</h3>
                        <span className="status-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Monthly</span>
                    </div>
                    <LineChart data={priceData} />
                </div>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3>Regional Distribution</h3>
                        <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>View Map</span>
                    </div>
                    <BarChart data={regionData} />
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Highest concentration in <strong style={{ color: 'var(--text-main)' }}>Southern Region</strong>
                        <span style={{ float: 'right', color: '#f59e0b', fontWeight: 600 }}>+12% YoY</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3>Recent Transactions</h3>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>View All</span>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Property ID</th>
                                <th>Status</th>
                                <th>Value</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t.transaction_id}>
                                    <td style={{ fontWeight: 600 }}>{t.property_id}</td>
                                    <td>
                                        <span className={`status-badge ${t.status === 'Completed' ? 'status-success' :
                                                t.status === 'Pending' ? 'status-pending' : 'status-error'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>${t.value.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{t.date}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{t.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend, color, bgIcon, sub, textColor, trendColor }) => {
    const isPrimary = color === 'var(--primary)';
    return (
        <div className="card metric-card" style={{ background: color, color: isPrimary ? 'white' : textColor, border: isPrimary ? 'none' : '' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: 40, height: 40,
                    borderRadius: 8,
                    background: isPrimary ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{
                        fontSize: '0.8rem', fontWeight: 600,
                        color: isPrimary ? 'white' : (trendColor === 'red' ? 'var(--danger)' : 'var(--success)'),
                        background: isPrimary ? 'rgba(255,255,255,0.2)' : (trendColor === 'red' ? '#fee2e2' : '#dcfce7'),
                        padding: '0.2rem 0.5rem', borderRadius: 4
                    }}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '1rem' }}>{title}</div>
                <div className="metric-value">{value}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{sub}</div>
            </div>
        </div>
    );
};

export default DashboardPage;
