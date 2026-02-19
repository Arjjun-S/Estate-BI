import React, { useEffect, useState } from 'react';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import { getCities, getDashboardMetrics, getPriceTrends, getRegionalDistribution, getRecentTransactions } from '../services/api';
import { Package, TrendingUp, Home, Clock, Upload, ArrowUpRight, ArrowDownRight, Loader2, MapPin, ChevronDown } from 'lucide-react';

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
    const [error, setError] = useState(null);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('all');

    // Fetch cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await getCities();
                if (response?.data) {
                    setCities(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch cities:', err);
            }
        };
        fetchCities();
    }, []);

    // Fetch dashboard data when city changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            console.log("📊 Fetching dashboard data for city:", selectedCity);
            
            try {
                // Fetch each endpoint separately to handle individual failures
                const [metricsRes, priceRes, regionRes, transRes] = await Promise.allSettled([
                    getDashboardMetrics(selectedCity),
                    getPriceTrends(selectedCity),
                    getRegionalDistribution(selectedCity),
                    getRecentTransactions(selectedCity)
                ]);
                
                // Handle metrics
                if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
                    setMetrics(metricsRes.value.data);
                }
                
                // Handle price data
                if (priceRes.status === 'fulfilled' && priceRes.value?.data) {
                    setPriceData(Array.isArray(priceRes.value.data) ? priceRes.value.data : []);
                }
                
                // Handle region data
                if (regionRes.status === 'fulfilled' && regionRes.value?.data) {
                    setRegionData(Array.isArray(regionRes.value.data) ? regionRes.value.data : []);
                }
                
                // Handle transactions
                if (transRes.status === 'fulfilled' && transRes.value?.data) {
                    setTransactions(Array.isArray(transRes.value.data) ? transRes.value.data : []);
                }
                
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [selectedCity]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>System Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Real-time business intelligence for Housing Data Warehouse V3.0</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* City Filter */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            style={{
                                padding: '0.5rem 2.5rem 0.5rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-main)',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                minWidth: '180px',
                                appearance: 'none'
                            }}
                        >
                            <option value="all">All Cities ({cities.reduce((sum, c) => sum + c.property_count, 0).toLocaleString()})</option>
                            {cities.slice(0, 20).map(city => (
                                <option key={city.city} value={city.city}>
                                    {city.city} ({city.property_count.toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '12px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                    </div>
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
                    value={`₹${(metrics.avg_price / 100000).toFixed(1)}L`}
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
                                    <td style={{ fontWeight: 600 }}>₹{Number(t.value).toLocaleString()}</td>
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
