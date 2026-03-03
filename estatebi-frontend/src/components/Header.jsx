import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Bell, Moon, Sun } from 'lucide-react';

const Header = ({ onSearch }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
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

    return (
        <header className="top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.png" alt="EstateBI Logo" style={{ width: 36, height: 36, borderRadius: '0.5rem' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>EstateBI</span>
            </div>

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
                        background: 'var(--bg-color)'
                    }}
                />
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                    className="btn btn-outline" 
                    style={{ borderRadius: '50%', padding: '0.6rem', border: 'none' }}
                    onClick={toggleDarkMode}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.6rem', border: 'none' }}>
                    <Bell size={20} />
                </button>
                <div 
                    onClick={() => navigate('/profile')}
                    style={{ 
                        width: 40, 
                        height: 40, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                    title="View Profile"
                >
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};

export default Header;
