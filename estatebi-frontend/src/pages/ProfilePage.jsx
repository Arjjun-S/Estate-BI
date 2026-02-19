import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Save, Loader2, Key, Camera } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Edit mode states
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    // Password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await api.get('/auth/profile');
            setUser(response.data);
            setName(response.data.name);
            setEmail(response.data.email);
        } catch (error) {
            console.error('Error loading profile:', error);
            // Fall back to localStorage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(storedUser);
            setName(storedUser.name || '');
            setEmail(storedUser.email || '');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/auth/profile', { name, email });
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setEditMode(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/auth/change-password', { 
                currentPassword, 
                newPassword 
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setShowPasswordChange(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return { bg: '#fee2e2', color: '#991b1b' };
            case 'analyst': return { bg: '#dbeafe', color: '#1e40af' };
            default: return { bg: '#f3f4f6', color: '#374151' };
        }
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="page-content">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Profile</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your account settings and preferences</p>
            </div>

            {message.text && (
                <div style={{ 
                    background: message.type === 'success' ? '#d1fae5' : '#fee2e2', 
                    color: message.type === 'success' ? '#065f46' : '#991b1b', 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                {/* Profile Card */}
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ 
                        width: 100, 
                        height: 100, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 700,
                        position: 'relative'
                    }}>
                        {getInitials(user?.name)}
                        <button style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--card-bg)',
                            border: '2px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)'
                        }}>
                            <Camera size={14} />
                        </button>
                    </div>
                    
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{user?.name || 'User'}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user?.email}</p>
                    
                    <span style={{ 
                        display: 'inline-block',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        ...getRoleBadgeColor(user?.role)
                    }}>
                        {user?.role || 'User'}
                    </span>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <Calendar size={16} />
                            <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Details & Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Profile Details */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Profile Details</h3>
                            {!editMode && (
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => setEditMode(true)}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {editMode ? (
                            <form onSubmit={handleSaveProfile}>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={16} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={16} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                                    </button>
                                    <button type="button" className="btn btn-outline" onClick={() => { setEditMode(false); setName(user?.name); setEmail(user?.email); }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                    <User size={20} style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Full Name</p>
                                        <p style={{ fontWeight: 500 }}>{user?.name || 'Not set'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                    <Mail size={20} style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Email Address</p>
                                        <p style={{ fontWeight: 500 }}>{user?.email || 'Not set'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                    <Shield size={20} style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Role</p>
                                        <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{user?.role || 'User'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Settings */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Security Settings</h3>
                        </div>

                        {showPasswordChange ? (
                            <form onSubmit={handleChangePassword}>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Key size={16} /> Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Update Password'}
                                    </button>
                                    <button type="button" className="btn btn-outline" onClick={() => { setShowPasswordChange(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Key size={20} style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <p style={{ fontWeight: 500 }}>Password</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>••••••••••••</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => setShowPasswordChange(true)}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
