import React, { useState, useEffect } from 'react';
import { getLogs, getLogStats } from '../services/api';
import { Activity, AlertCircle, CheckCircle, Clock, Download, Filter, Search, RefreshCw, User, Loader2 } from 'lucide-react';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEvent, setFilterEvent] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        logins: 0,
        uploads: 0
    });

    useEffect(() => {
        fetchLogs();
    }, [filterEvent]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = filterEvent ? { event: filterEvent } : {};
            const res = await getLogs(params);
            setLogs(res.data);
            
            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            setStats({
                total: res.data.length,
                today: res.data.filter(l => l.time?.startsWith(today)).length,
                logins: res.data.filter(l => l.event?.toLowerCase().includes('login')).length,
                uploads: res.data.filter(l => l.event?.toLowerCase().includes('upload') || l.event?.toLowerCase().includes('import')).length
            });
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventIcon = (event) => {
        const e = event?.toLowerCase() || '';
        if (e.includes('login')) return <User size={16} color="#10b981" />;
        if (e.includes('upload') || e.includes('import')) return <Activity size={16} color="#3b82f6" />;
        if (e.includes('error') || e.includes('fail')) return <AlertCircle size={16} color="#ef4444" />;
        if (e.includes('success') || e.includes('complete')) return <CheckCircle size={16} color="#10b981" />;
        return <Clock size={16} color="#64748b" />;
    };

    const getEventBadgeColor = (event) => {
        const e = event?.toLowerCase() || '';
        if (e.includes('login')) return { bg: '#d1fae5', color: '#065f46' };
        if (e.includes('upload') || e.includes('import')) return { bg: '#dbeafe', color: '#1e40af' };
        if (e.includes('error') || e.includes('fail')) return { bg: '#fee2e2', color: '#991b1b' };
        if (e.includes('update') || e.includes('setting')) return { bg: '#fef3c7', color: '#92400e' };
        return { bg: '#f1f5f9', color: '#475569' };
    };

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.event?.toLowerCase().includes(term) ||
            log.user?.toLowerCase().includes(term) ||
            log.details?.toLowerCase().includes(term)
        );
    });

    const uniqueEvents = [...new Set(logs.map(l => l.event))].filter(Boolean);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>System Logs</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track all activity and system events in real-time</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={fetchLogs}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="btn btn-primary">
                        <Download size={16} /> Export Logs
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={20} color="#64748b" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Events</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={20} color="#f59e0b" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.today}</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User Logins</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.logins}</p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={20} color="#3b82f6" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Data Imports</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.uploads}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px', width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} color="var(--text-secondary)" />
                        <select 
                            value={filterEvent} 
                            onChange={(e) => setFilterEvent(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: '150px' }}
                        >
                            <option value="">All Events</option>
                            {uniqueEvents.map(event => (
                                <option key={event} value={event}>{event}</option>
                            ))}
                        </select>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Showing {filteredLogs.length} of {logs.length} logs
                    </span>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '180px' }}>Timestamp</th>
                                    <th style={{ width: '120px' }}>User</th>
                                    <th style={{ width: '160px' }}>Event</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No logs found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, index) => {
                                        const badgeColor = getEventBadgeColor(log.event);
                                        return (
                                            <tr key={log.id || index}>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                                    {log.time}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ 
                                                            width: 28, 
                                                            height: 28, 
                                                            borderRadius: '50%', 
                                                            background: 'var(--primary)', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600
                                                        }}>
                                                            {log.user?.charAt(0)?.toUpperCase() || 'S'}
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem' }}>{log.user || 'System'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.375rem',
                                                        padding: '0.375rem 0.75rem', 
                                                        borderRadius: '9999px', 
                                                        fontSize: '0.8rem',
                                                        fontWeight: 500,
                                                        background: badgeColor.bg,
                                                        color: badgeColor.color
                                                    }}>
                                                        {getEventIcon(log.event)}
                                                        {log.event}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    {log.details || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsPage;
