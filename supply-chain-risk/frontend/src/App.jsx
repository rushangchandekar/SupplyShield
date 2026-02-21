import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SupplyMap from './pages/SupplyMap';
import Signals from './pages/Signals';
import Categories from './pages/Categories';
import Pricing from './pages/Pricing';

/* Clerk variables must stay in JS — CSS custom properties don't map 1:1 */
const clerkVariables = {
    colorPrimary: '#3b82f6',
    colorBackground: '#0f172a',
    colorInputBackground: 'rgba(255,255,255,0.05)',
    colorInputText: '#f1f5f9',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    colorNeutral: '#475569',
    borderRadius: '10px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '15px',
};

function SignInPage() {
    return (
        <div className="signin-split">
            {/* Left Panel — Brand Hero */}
            <div className="signin-hero">
                <div className="signin-hero-blob" />

                <div className="signin-logo">
                    <div className="brand-icon signin-brand-icon">⚡</div>
                    <span className="signin-brand-name">SupplyShield</span>
                </div>

                <div className="signin-headline">
                    <h1>Supply Chain<br /><span className="gradient-text">Risk Intelligence</span></h1>
                    <p>Real-time monitoring across procurement, transport, and trade corridors. Powered by live government data.</p>
                </div>

                <div className="signin-features">
                    {[
                        { icon: '🌾', label: 'Mandi & eNAM price feeds' },
                        { icon: '🌦️', label: 'Weather disruption signals' },
                        { icon: '📊', label: 'Import/export trade analytics' },
                        { icon: '🔍', label: 'AI-powered recommendations' },
                    ].map(({ icon, label }) => (
                        <div key={label} className="signin-feature-item">
                            <div className="signin-feature-icon">{icon}</div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                <div className="signin-footer-note">
                    <p>Built for India's supply chain ecosystem • Hackathon 2026</p>
                </div>
            </div>

            {/* Right Panel — Sign In Form */}
            <div className="signin-form-panel">
                <div className="signin-form-container">
                    <div className="signin-form-header">
                        <h2>Welcome back 👋</h2>
                        <p>Sign in to your SupplyShield account to continue</p>
                    </div>

                    <div className="signin-clerk-wrapper">
                        <SignIn appearance={{ variables: clerkVariables }} />
                    </div>

                    <div className="signin-helper">
                        <div className="signin-helper-box">
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

export default function App() {
    return (
        <ThemeProvider>
            <Router>
                <SignedOut>
                    <SignInPage />
                </SignedOut>
                <SignedIn>
                    <AuthProvider>
                        <div className="app-layout">
                            <Navbar />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/map" element={<SupplyMap />} />
                                    <Route path="/signals" element={<Signals />} />
                                    <Route path="/categories" element={<Categories />} />
                                    <Route path="/pricing" element={<Pricing />} />
                                </Routes>
                            </main>
                            <footer className="app-footer">
                                <p>© 2026 SupplyShield — Supply Chain Risk Intelligence Platform</p>
                                <p>Data sources: data.gov.in • eNAM • OpenWeatherMap • Enterprise Logistics APIs</p>
                            </footer>
                        </div>
                    </AuthProvider>
                </SignedIn>
            </Router>
        </ThemeProvider>
    );
}