import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isPremium } = useAuth();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">⚡</div>
                    <span>SupplyShield</span>
                </Link>
                <div className="navbar-links">
                    <Link to="/" className={isActive('/')}>Dashboard</Link>
                    <Link to="/map" className={isActive('/map')}>Supply Map</Link>
                    <Link to="/signals" className={isActive('/signals')}>Live Signals</Link>
                    <Link to="/categories" className={isActive('/categories')}>Categories</Link>
                </div>
                <div className="navbar-actions">
                    {user ? (
                        <>
                            {isPremium ? (
                                <span className="badge-premium">⭐ Premium</span>
                            ) : (
                                <Link to="/pricing" className="btn btn-premium btn-sm">Upgrade</Link>
                            )}
                            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
