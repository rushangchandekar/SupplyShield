import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({ email: '', password: '', full_name: '', company: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try { const res = await registerUser(formData); login(res.data.access_token, res.data.user); navigate('/'); }
        catch (err) { setError(err.response?.data?.detail || 'Registration failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="glass-card auth-card animate-in">
                <h2>Create your account</h2>
                <p className="auth-subtitle">Start monitoring supply chain risks for free</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleChange} placeholder="John Doe" /></div>
                    <div className="form-group"><label className="form-label">Company</label><input type="text" name="company" className="form-input" value={formData.company} onChange={handleChange} placeholder="Your company name" /></div>
                    <div className="form-group"><label className="form-label">Email *</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="you@company.com" required /></div>
                    <div className="form-group"><label className="form-label">Password *</label><input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} /></div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>{loading ? 'Creating account...' : 'Create Free Account'}</button>
                </form>
                <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
            </div>
        </div>
    );
}
