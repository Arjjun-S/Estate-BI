import React, { useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';

const SettingsPage = () => {
    const [user, setUser] = useState({
        name: "Alex Sterling",
        email: "alex@estatebi.com",
        role: "Senior Analyst"
    });

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h1>Settings</h1>
            <p>Manage your account and preferences.</p>

            <div className="card" style={{ maxWidth: 600, marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                        <User size={32} />
                    </div>
                    <div>
                        <button className="btn btn-outline" style={{ fontSize: '0.8rem' }}>Change Avatar</button>
                    </div>
                </div>

                <div className="input-group">
                    <label>Display Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-secondary)' }} />
                        <input type="text" name="name" value={user.name} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-secondary)' }} />
                        <input type="email" name="email" value={user.email} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Role</label>
                    <div style={{ position: 'relative' }}>
                        <Shield size={18} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-secondary)' }} />
                        <input type="text" name="role" value={user.role} readOnly style={{ paddingLeft: '2.5rem', background: '#f1f5f9' }} />
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-outline">Cancel</button>
                    <button className="btn btn-primary">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
