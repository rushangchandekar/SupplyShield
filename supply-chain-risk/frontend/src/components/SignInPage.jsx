import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import clerkAppearance from '../config/clerkAppearance';

const FEATURES = [
    { icon: '🌾', label: 'Mandi & eNAM price feeds' },
    { icon: '🌦️', label: 'Weather disruption signals' },
    { icon: '📊', label: 'Import/export trade analytics' },
    { icon: '🔍', label: 'AI-powered recommendations' },
];

export default function SignInPage() {
    return (
        <div className="signin-split">
            {/* Left Panel — Brand Hero */}
            <div className="signin-hero">
                {/* Decorative blob */}
                <div className="signin-blob" />

                {/* Logo */}
                <div className="signin-logo">
                    <div className="brand-icon signin-brand-icon">⚡</div>
                    <span className="signin-brand-text">SupplyShield</span>
                </div>

                {/* Headline */}
                <div className="signin-headline">
                    <h1 className="signin-title">
                        Supply Chain<br />
                        <span className="signin-title-gradient">Risk Intelligence</span>
                    </h1>
                    <p className="signin-subtitle">
                        Real-time monitoring across procurement, transport, and trade corridors. Powered by live government data.
                    </p>
                </div>

                {/* Feature bullets */}
                <div className="signin-features">
                    {FEATURES.map(({ icon, label }) => (
                        <div key={label} className="signin-feature-item">
                            <div className="signin-feature-icon">{icon}</div>
                            <span className="signin-feature-label">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="signin-footer-note">
                    <p>Built for India's supply chain ecosystem • Hackathon 2026</p>
                </div>
            </div>

            {/* Right Panel — Sign In Form */}
            <div className="signin-form-panel">
                <div className="signin-form-wrapper">
                    <div className="signin-form-header">
                        <h2>Welcome back 👋</h2>
                        <p>Sign in to your SupplyShield account to continue</p>
                    </div>

                    <div className="signin-clerk-container">
                        <SignIn appearance={clerkAppearance} routing="hash" fallbackRedirectUrl="/" />
                    </div>

                    {/* Forgot password helper + secured text */}
                    <div className="signin-helper">
                        <div className="signin-helper-tip">
                            <span className="signin-helper-icon">🔑</span>
                            <span>
                                Forgot password?{' '}
                                <span className="signin-helper-link">
                                    Enter your email above, then use "Forgot password?" link
                                </span>
                            </span>
                        </div>
                        <p className="signin-secured-text">
                            SupplyShield is secured by Clerk authentication
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
