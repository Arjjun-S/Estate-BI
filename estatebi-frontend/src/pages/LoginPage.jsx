import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import api from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            
            // Store token and user info
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Set token for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-color)' }}>
            <div className="card" style={{ width: 400, padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ margin: '0 auto', marginBottom: '1rem', width: 48, height: 48, background: 'var(--primary)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <LayoutDashboard size={28} />
                    </div>
                    <h2>EstateBI</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                </div>

                {error && (
                    <div style={{ 
                        background: '#fee2e2', 
                        color: '#991b1b', 
                        padding: '0.75rem', 
                        borderRadius: '0.5rem', 
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@estatebi.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <p>Demo: admin@estatebi.com / admin123</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
