import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user } = useUser();
    const { isPremium } = useAuth();
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
                    {isPremium ? (
                        <span className="badge-premium" style={{
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,179,8,0.1))',
                            color: '#f59e0b',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid rgba(245,158,11,0.3)',
                        }}>⭐ Premium</span>
                    ) : (
                        <Link to="/pricing" className="btn btn-premium btn-sm">Upgrade</Link>
                    )}
                    {user && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: 8 }}>
                            {user.firstName || user.primaryEmailAddress?.emailAddress}
                        </span>
                    )}
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: { width: 32, height: 32 },
                            }
                        }}
                    />
                </div>
            </div>
        </nav>
    );
}
