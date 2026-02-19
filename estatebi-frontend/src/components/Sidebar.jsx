import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, BarChart3, ScrollText, Settings, LogOut } from 'lucide-react';
import { logout } from '../services/api';
import '../index.css';

const Sidebar = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <LayoutDashboard size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>EstateBI</h2>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <NavLink to="/dashboard" className={({ isActive }) => `btn btn-outline ${isActive ? 'active-nav' : ''}`} style={{ border: 'none', justifyContent: 'flex-start', background: 'transparent' }}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/upload" className={({ isActive }) => `btn btn-outline ${isActive ? 'active-nav' : ''}`} style={{ border: 'none', justifyContent: 'flex-start', background: 'transparent' }}>
                    <UploadCloud size={20} /> Data Upload
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `btn btn-outline ${isActive ? 'active-nav' : ''}`} style={{ border: 'none', justifyContent: 'flex-start', background: 'transparent' }}>
                    <BarChart3 size={20} /> Reports
                </NavLink>
                <NavLink to="/logs" className={({ isActive }) => `btn btn-outline ${isActive ? 'active-nav' : ''}`} style={{ border: 'none', justifyContent: 'flex-start', background: 'transparent' }}>
                    <ScrollText size={20} /> System Logs
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `btn btn-outline ${isActive ? 'active-nav' : ''}`} style={{ border: 'none', justifyContent: 'flex-start', background: 'transparent' }}>
                    <Settings size={20} /> Settings
                </NavLink>
            </nav>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', border: 'none', color: 'var(--danger)', justifyContent: 'flex-start' }}
                    onClick={handleLogout}
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
