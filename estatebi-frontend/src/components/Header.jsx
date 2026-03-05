import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Bell, Moon, Sun } from 'lucide-react';
import { getCurrentUser } from '../services/api';

const Header = ({ onSearch }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const user = getCurrentUser();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="top-bar">
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="EstateBI" style={{ width: 36, height: 36, borderRadius: '0.5rem' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>EstateBI</span>
            </div>

            {/* Search Section */}
            <div style={{ position: 'relative', width: 400 }}>
                <input
                    type="text"
                    placeholder="Search cities..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        width: '100%',
                        padding: '0.6rem 0.6rem 0.6rem 2.5rem',
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        color: 'var(--text-main)'
                    }}
                />
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Dark Mode Toggle */}
                <button 
                    className="btn btn-outline" 
                    onClick={toggleDarkMode}
                    style={{ borderRadius: '50%', padding: '0.6rem', border: 'none', background: 'var(--card-bg)' }}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun size={20} color="var(--text-main)" /> : <Moon size={20} color="var(--text-main)" />}
                </button>

                {/* Notification Bell */}
                <button className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.6rem', border: 'none', background: 'var(--card-bg)' }}>
                    <Bell size={20} color="var(--text-main)" />
                </button>

                {/* Profile Icon */}
                <div 
                    onClick={handleProfileClick}
                    style={{ 
                        width: 40, 
                        height: 40, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}
                    title={user?.name || 'Profile'}
                >
                    {user?.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        getInitials(user?.name)
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
