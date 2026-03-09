import React, { useEffect, useState } from 'react';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import { getCities, getDashboardMetrics, getPriceTrends, getRegionalDistribution, getRecentTransactions, getProperty } from '../services/api';
import { Package, TrendingUp, Home, Clock, Upload, Loader2, MapPin, ChevronDown, X, Building, Calendar, DollarSign, Info, Filter, RefreshCw } from 'lucide-react';

const DashboardPage = ({ globalFilters, onGlobalFilter }) => {
    // Metrics State
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
    const [cities, setCities] = useState([]);

    // Derived Filter State (from props)
    const { city: selectedCity, type: selectedType, status: selectedStatus, minPrice, maxPrice } = globalFilters;
    const [showFilters, setShowFilters] = useState(false);

    // Transaction modal states
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionModal, setTransactionModal] = useState(false);
    const [propertyDetail, setPropertyDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

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

    // Helper to get active filters block
    const getActiveFilters = () => {
        const activeFilters = { city: selectedCity };
        if (selectedType !== 'all') activeFilters.type = selectedType;
        if (selectedStatus !== 'all') activeFilters.status = selectedStatus;
        if (minPrice) activeFilters.minPrice = minPrice;
        if (maxPrice) activeFilters.maxPrice = maxPrice;
        return activeFilters;
    };

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            const filters = getActiveFilters();
            console.log("📊 Fetching dashboard data with filters:", filters);

            const [metricsRes, priceRes, regionRes, transRes] = await Promise.allSettled([
                getDashboardMetrics(filters),
                getPriceTrends(filters),
                getRegionalDistribution(filters),
                getRecentTransactions(filters)
            ]);

            if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
                setMetrics(metricsRes.value.data);
            }
            if (priceRes.status === 'fulfilled' && priceRes.value?.data) {
                setPriceData(Array.isArray(priceRes.value.data) ? priceRes.value.data : []);
            }
            if (regionRes.status === 'fulfilled' && regionRes.value?.data) {
                setRegionData(Array.isArray(regionRes.value.data) ? regionRes.value.data : []);
            }
            if (transRes.status === 'fulfilled' && transRes.value?.data) {
                setTransactions(Array.isArray(transRes.value.data) ? transRes.value.data : []);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when filters change
    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalFilters]);

    // Handle manual refresh
    const handleRefresh = () => fetchDashboardData();

    // Handle transaction click to show details
    const handleTransactionClick = async (transaction) => {
        setSelectedTransaction(transaction);
        setTransactionModal(true);
        setLoadingDetail(true);

        try {
            if (transaction.property_id) {
                const response = await getProperty(transaction.property_id.replace(/[A-Z]/g, ''));
                if (response?.data) {
                    setPropertyDetail(response.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch property details:', error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeTransactionModal = () => {
        setTransactionModal(false);
        setSelectedTransaction(null);
        setPropertyDetail(null);
    };

    const resetFilters = () => {
        onGlobalFilter({
            city: 'all',
            type: 'all',
            status: 'all',
            minPrice: '',
            maxPrice: ''
        });
    };

    return (
        <div className="dashboard-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>System Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Real-time business intelligence for Housing Data</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Filter size={16} /> Advanced Filters {(selectedType !== 'all' || selectedStatus !== 'all' || minPrice || maxPrice) && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
                    </button>
                    <button className="btn btn-outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* Configurable Filter Bar */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: showFilters ? 'block' : 'flex',
                boxShadow: showFilters ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: showFilters ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
                    gap: '1.5rem',
                    alignItems: 'end'
                }}>
                    {/* Primary Filter: City (Always visible) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Location Area</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }} />
                            <select
                                value={selectedCity}
                                onChange={(e) => onGlobalFilter({ city: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem 2.5rem', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer', appearance: 'none',
                                    fontWeight: 500
                                }}
                            >
                                <option value="all">All Available Cities</option>
                                {cities.map(city => (
                                    <option key={city.city} value={city.city}>{city.city}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    {/* Extended Filters */}
                    {showFilters && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Property Type</label>
                                <div style={{ position: 'relative' }}>
                                    <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                                    <select
                                        value={selectedType}
                                        onChange={(e) => onGlobalFilter({ type: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer', appearance: 'none' }}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Land">Land / Plots</option>
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Property Status</label>
                                <div style={{ position: 'relative' }}>
                                    <Info size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => onGlobalFilter({ status: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.95rem', cursor: 'pointer', appearance: 'none' }}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="Active">Active Listings</option>
                                        <option value="Pending">Pending / In Escrow</option>
                                        <option value="Sold">Sold / Completed</option>
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Min Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Min..."
                                        value={minPrice}
                                        onChange={(e) => onGlobalFilter({ minPrice: e.target.value })}
                                        onBlur={fetchDashboardData}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Max Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Max..."
                                        value={maxPrice}
                                        onChange={(e) => onGlobalFilter({ maxPrice: e.target.value })}
                                        onBlur={fetchDashboardData}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {showFilters && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', gap: '1rem' }}>
                        <button className="btn btn-outline" onClick={resetFilters}>Clear All Filters</button>
                        <button className="btn btn-primary" onClick={fetchDashboardData}>Apply Filter Ranges</button>
                    </div>
                )}
            </div>

            {/* Active Filter Chips */}
            {(selectedCity !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || minPrice || maxPrice) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Active Filters:</span>
                    {selectedCity !== 'all' && (
                        <div className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <span>City: {selectedCity}</span>
                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => onGlobalFilter({ city: 'all' })} />
                        </div>
                    )}
                    {selectedType !== 'all' && (
                        <div className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <span>Type: {selectedType}</span>
                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => onGlobalFilter({ type: 'all' })} />
                        </div>
                    )}
                    {selectedStatus !== 'all' && (
                        <div className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <span>Status: {selectedStatus}</span>
                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => onGlobalFilter({ status: 'all' })} />
                        </div>
                    )}
                    {minPrice && (
                        <div className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <span>min: ₹{Number(minPrice).toLocaleString()}</span>
                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => onGlobalFilter({ minPrice: '' })} />
                        </div>
                    )}
                    {maxPrice && (
                        <div className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <span>max: ₹{Number(maxPrice).toLocaleString()}</span>
                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => onGlobalFilter({ maxPrice: '' })} />
                        </div>
                    )}
                    <button
                        onClick={resetFilters}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 500 }}
                    >
                        Clear All
                    </button>
                </div>
            )}

            {loading && !showFilters ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
            ) : (
                <>
                    <div className="metrics-grid">
                        <MetricCard
                            title="Total Inventory"
                            value={metrics.total_inventory.toLocaleString()}
                            icon={<Package size={24} color="white" />}
                            trend="+2.4%"
                            color="var(--primary)"
                            sub="Based on filter criteria"
                        />
                        <MetricCard
                            title="Avg Market Price"
                            value={`₹${(metrics.avg_price / 100000).toFixed(1)}L`}
                            icon={<TrendingUp size={24} color="#f59e0b" />}
                            trend="-0.8%"
                            trendColor="red"
                            bgIcon="#fff"
                            color="#fff"
                            sub="Based on filter criteria"
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
                            sub="Across filtered regions"
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
                            sub="Filtered by criteria"
                            textColor="var(--text-main)"
                        />
                    </div>

                    {/* Market Insights Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 4, height: 24, background: 'var(--primary)', borderRadius: 2 }}></div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Market Insights</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Top Performing Location</p>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{regionData[0]?.region || (selectedCity !== 'all' ? selectedCity : 'Chennai')}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Highest Concentration of {selectedType !== 'all' ? selectedType : 'Properties'}</p>
                                </div>
                            </div>
                            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', color: '#10b981' }}>
                                    <DollarSign size={28} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Estimated Market Value</p>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>₹{((metrics.avg_price * metrics.total_inventory) / 10000000).toFixed(1)} Cr</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Based on {metrics.total_inventory} listings</p>
                                </div>
                            </div>
                            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: '#f59e0b' }}>
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Analysis Sentiment</p>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Bullish / Growth</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>+4.2% Market Momentum</p>
                                </div>
                            </div>
                        </div>
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
                                        <tr
                                            key={t.transaction_id}
                                            onClick={() => handleTransactionClick(t)}
                                            style={{ cursor: 'pointer' }}
                                            className="transaction-row"
                                        >
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
                                            <td style={{ color: 'var(--primary)', fontWeight: 500 }}>{t.action}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Transaction Detail Modal */}
                    {transactionModal && selectedTransaction && (
                        <div className="modal-overlay" onClick={closeTransactionModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Transaction Details</h2>
                                    <button className="modal-close" onClick={closeTransactionModal}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {/* Transaction Info */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                <Building size={16} />
                                                <span style={{ fontSize: '0.85rem' }}>Property ID</span>
                                            </div>
                                            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedTransaction.property_id}</p>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                <DollarSign size={16} />
                                                <span style={{ fontSize: '0.85rem' }}>Transaction Value</span>
                                            </div>
                                            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--success)' }}>₹{Number(selectedTransaction.value).toLocaleString()}</p>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                <Calendar size={16} />
                                                <span style={{ fontSize: '0.85rem' }}>Transaction Date</span>
                                            </div>
                                            <p style={{ fontWeight: 600 }}>{selectedTransaction.date}</p>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                <Info size={16} />
                                                <span style={{ fontSize: '0.85rem' }}>Status</span>
                                            </div>
                                            <span className={`status-badge ${selectedTransaction.status === 'Completed' ? 'status-success' :
                                                selectedTransaction.status === 'Pending' ? 'status-pending' : 'status-error'
                                                }`}>
                                                {selectedTransaction.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    {loadingDetail ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
                                        </div>
                                    ) : propertyDetail ? (
                                        <div>
                                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Property Information</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>City</p>
                                                    <p style={{ fontWeight: 500 }}>{propertyDetail.city || selectedTransaction.city}</p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type</p>
                                                    <p style={{ fontWeight: 500 }}>{propertyDetail.type || 'Residential'}</p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Area</p>
                                                    <p style={{ fontWeight: 500 }}>{propertyDetail.sqft ? `${propertyDetail.sqft} sqft` : 'N/A'}</p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bedrooms</p>
                                                    <p style={{ fontWeight: 500 }}>{propertyDetail.bedrooms || 'N/A'}</p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bathrooms</p>
                                                    <p style={{ fontWeight: 500 }}>{propertyDetail.bathrooms || 'N/A'}</p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Year Built</p>
                                                    <p style={{ fontWeight: 500 }}>{propertyDetail.year_built || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem', textAlign: 'center' }}>
                                            <p style={{ color: 'var(--text-secondary)' }}>Property details not available</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                                City: {selectedTransaction.city || 'N/A'}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button className="btn btn-outline" onClick={closeTransactionModal}>
                                            Close
                                        </button>
                                        <button className="btn btn-primary">
                                            {selectedTransaction.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend, color, sub, textColor, trendColor }) => {
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
