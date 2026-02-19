import React from 'react';
import { Search, User, Bell } from 'lucide-react';

const Header = () => {
    return (
        <header className="top-bar">
            <div style={{ position: 'relative', width: 400 }}>
                <input
                    type="text"
                    placeholder="Search datasets..."
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-outline" style={{ borderRadius: '50%', padding: '0.6rem', border: 'none' }}>
                    <Bell size={20} />
                </button>
                <div style={{ width: 40, height: 40, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};

export default Header;
