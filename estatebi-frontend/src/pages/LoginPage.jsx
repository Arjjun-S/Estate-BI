import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        
        try {
            await api.post('/auth/signup', { name, email, password });
            setSuccess('Account created successfully! Please sign in.');
            setIsSignup(false);
            setName('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignup(!isSignup);
        setError('');
        setSuccess('');
        setName('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            width: '100%',
            background: 'var(--bg-color)',
            padding: '2rem'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '420px'
            }}>
                <div className="card" style={{ 
                    width: '100%',
                    padding: '2.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ 
                            margin: '0 auto', 
                            marginBottom: '1rem', 
                            width: 56, 
                            height: 56, 
                            background: 'var(--primary)', 
                            borderRadius: '1rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                        }}>
                            <LayoutDashboard size={30} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>EstateBI</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            {isSignup ? 'Create your account' : 'Welcome back! Sign in to continue'}
                        </p>
                    </div>

                    {error && (
                        <div style={{ 
                            background: '#fee2e2', 
                            color: '#991b1b', 
                            padding: '0.875rem', 
                            borderRadius: '0.5rem', 
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ 
                            background: '#d1fae5', 
                            color: '#065f46', 
                            padding: '0.875rem', 
                            borderRadius: '0.5rem', 
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={isSignup ? handleSignup : handleLogin}>
                        {isSignup && (
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ paddingLeft: '40px', width: '100%' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ paddingLeft: '40px', width: '100%' }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {isSignup && (
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block', color: 'var(--text-main)' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: '40px', width: '100%' }}
                                    />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                marginTop: '1.5rem',
                                padding: '0.875rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'var(--primary)',
                                border: 'none',
                                borderRadius: '0.5rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem' }} /> {isSignup ? 'Creating Account...' : 'Signing in...'}</>
                            ) : (
                                isSignup ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '1.5rem', 
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button 
                                type="button"
                                onClick={toggleMode}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--primary)', 
                                    fontWeight: 600, 
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {isSignup ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>

                    {!isSignup && (
                        <div style={{ 
                            textAlign: 'center', 
                            marginTop: '1rem', 
                            fontSize: '0.8rem', 
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-color)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem'
                        }}>
                            <p><strong>Demo:</strong> admin@estatebi.com / admin123</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
