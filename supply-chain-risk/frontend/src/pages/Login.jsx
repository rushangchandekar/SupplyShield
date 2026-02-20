import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try { const res = await loginUser({ email, password }); login(res.data.access_token, res.data.user); navigate('/'); }
        catch (err) { setError(err.response?.data?.detail || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="glass-card auth-card animate-in">
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to your SupplyShield account</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required /></div>
                    <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
                </form>
                <div className="auth-footer">Don't have an account? <Link to="/register">Sign up free</Link></div>
            </div>
        </div>
    );
}
