import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { user } = useUser();
    const { isPremium } = useAuth();
    const { isDark, toggle } = useTheme();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';
    const [mobileOpen, setMobileOpen] = useState(false);
    const panelRef = useRef(null);

    // Close mobile nav on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    // Close on outside click
    useEffect(() => {
        if (!mobileOpen) return;
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setMobileOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [mobileOpen]);

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/map', label: 'Supply Map', icon: '🗺️' },
        { path: '/signals', label: 'Live Signals', icon: '📡' },
        { path: '/categories', label: 'Categories', icon: '📁' },
    ];

    return (
        <>
            <nav className="navbar" id="main-navbar">
                <div className="navbar-inner">
                    <Link to="/" className="navbar-brand" id="brand-link">
                        <div className="brand-icon">⚡</div>
                        <span>SupplyShield</span>
                    </Link>
                    <div className="navbar-links">
                        {navLinks.map(({ path, label }) => (
                            <Link key={path} to={path} className={isActive(path)} id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}>
                                {label}
                            </Link>
                        ))}
                    </div>
                    <div className="navbar-actions">
                        <button
                            className={`theme-toggle ${isDark ? '' : 'light'}`}
                            onClick={toggle}
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label="Toggle dark/light mode"
                            id="theme-toggle-btn"
                        >
                            <span className="theme-toggle-thumb">
                                {isDark ? '🌙' : '☀️'}
                            </span>
                        </button>

                        {isPremium ? (
                            <span className="badge-premium" id="premium-badge">⭐ Premium</span>
                        ) : (
                            <Link to="/pricing" className="btn btn-premium btn-sm" id="upgrade-btn">Upgrade</Link>
                        )}
                        {user && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: 4, fontWeight: 500 }}>
                                {user.firstName || user.primaryEmailAddress?.emailAddress}
                            </span>
                        )}
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: { avatarBox: { width: 34, height: 34 } }
                            }}
                        />
                        <button
                            className="hamburger-btn"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation menu"
                            id="hamburger-btn"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Overlay */}
            <div className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
            <div className={`mobile-nav-panel ${mobileOpen ? 'open' : ''}`} ref={panelRef}>
                <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingLeft: 18 }}>
                    <div className="brand-icon" style={{ width: 30, height: 30, fontSize: '0.9rem' }}>⚡</div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>SupplyShield</span>
                </div>
                {navLinks.map(({ path, label, icon }) => (
                    <Link key={path} to={path} className={isActive(path)} onClick={() => setMobileOpen(false)}>
                        <span style={{ marginRight: 10 }}>{icon}</span>{label}
                    </Link>
                ))}
                <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border-glass)' }}>
                    {!isPremium && (
                        <Link to="/pricing" className="btn btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                            ⭐ Upgrade to Premium
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
