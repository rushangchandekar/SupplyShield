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

const clerkAppearance = {
    variables: {
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
    },
    elements: {
        rootBox: {
            width: '100%',
            maxWidth: '420px',
        },
        card: {
            background: 'rgba(15, 23, 42, 0.0)',
            boxShadow: 'none',
            border: 'none',
            padding: '0',
        },
        header: {
            display: 'none',
        },
        socialButtonsBlockButton: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '10px',
            fontWeight: '600',
            transition: 'all 0.2s',
        },
        socialButtonsBlockButtonText: {
            color: '#f1f5f9',
            fontWeight: '600',
        },
        socialButtonsBlockButtonArrow: {
            color: '#94a3b8',
        },
        dividerRow: {
            color: '#475569',
        },
        dividerLine: {
            background: 'rgba(255,255,255,0.07)',
        },
        dividerText: {
            color: '#64748b',
            fontSize: '12px',
        },
        formFieldLabel: {
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
        },
        formFieldInput: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '10px',
            fontSize: '15px',
            padding: '11px 14px',
        },
        formFieldInputShowPasswordButton: {
            color: '#64748b',
        },
        // Forgot password link styling
        formFieldAction: {
            color: '#3b82f6',
            fontWeight: '600',
            fontSize: '13px',
        },
        formFieldAction__password: {
            color: '#3b82f6',
            fontWeight: '600',
        },
        formButtonPrimary: {
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '15px',
            padding: '12px',
            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            transition: 'all 0.2s',
        },
        footerActionLink: {
            color: '#3b82f6',
            fontWeight: '700',
        },
        footer: {
            background: 'transparent',
        },
        footerAction: {
            color: '#64748b',
        },
        identityPreviewEditButton: {
            color: '#3b82f6',
        },
        alert: {
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '10px',
        },
        alertText: {
            color: '#f43f5e',
        },
        formButtonReset: {
            color: '#3b82f6',
            fontWeight: '600',
        },
        alternativeMethodsBlockButton: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '10px',
        },
        otpCodeFieldInput: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '8px',
        },
    },
};

function SignInPage() {
    return (
        <div className="signin-split" style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#0b0f1a',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            {/* Left Panel — Brand Hero */}
            <div className="signin-hero" style={{
                background: 'linear-gradient(145deg, #0b0f1a 0%, #0f172a 50%, #0b1a2e 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 4vw',
                position: 'relative',
                overflow: 'hidden',
                borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
                {/* Decorative blob */}
                <div style={{
                    position: 'absolute', top: -120, left: -120,
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '8vh' }}>
                    <div className="brand-icon" style={{ width: 48, height: 48, fontSize: '1.5rem', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>⚡</div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                        SupplyShield
                    </span>
                </div>

                {/* Headline */}
                <div style={{ marginBottom: 40, maxWidth: 480 }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff',
                        letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
                    }}>
                        Supply Chain<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Risk Intelligence</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Real-time monitoring across procurement, transport, and trade corridors. Powered by live government data.
                    </p>
                </div>

                {/* Feature bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                        { icon: '🌾', label: 'Mandi & eNAM price feeds' },
                        { icon: '🌦️', label: 'Weather disruption signals' },
                        { icon: '📊', label: 'Import/export trade analytics' },
                        { icon: '🔍', label: 'AI-powered recommendations' },
                    ].map(({ icon, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 42, height: 42,
                                background: 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.2)',
                                borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', flexShrink: 0,
                            }}>{icon}</div>
                            <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 500 }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div style={{ marginTop: '10vh', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                        Built for India's supply chain ecosystem • Hackathon 2026
                    </p>
                </div>
            </div>

            {/* Right Panel — Sign In Form */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 24px',
                overflowY: 'auto',
                background: '#0f172a',
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>
                    <div style={{ marginBottom: 32, textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                            Welcome back 👋
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            Sign in to your SupplyShield account to continue
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 24,
                        padding: '12px',
                        backdropFilter: 'blur(20px)',
                    }}>
                        <SignIn appearance={clerkAppearance} />
                    </div>

                    {/* Forgot password helper + secured text */}
                    <div style={{
                        marginTop: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 14,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            background: 'rgba(59,130,246,0.06)',
                            border: '1px solid rgba(59,130,246,0.12)',
                            borderRadius: 10,
                            fontSize: '0.82rem',
                            color: '#94a3b8',
                        }}>
                            <span style={{ fontSize: '1rem' }}>🔑</span>
                            <span>
                                Forgot password?{' '}
                                <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                                    Enter your email above, then use "Forgot password?" link
                                </span>
                            </span>
                        </div>
                        <p style={{ color: '#334155', fontSize: '0.78rem' }}>
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
                            <footer style={{
                                padding: '24px 32px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem',
                            }}>
                                <p>© 2026 SupplyShield — Supply Chain Risk Intelligence Platform</p>
                                <p style={{ marginTop: 4 }}>
                                    Data sources: data.gov.in • eNAM • OpenWeatherMap • Enterprise Logistics APIs
                                </p>
                            </footer>
                        </div>
                    </AuthProvider>
                </SignedIn>
            </Router>
        </ThemeProvider>
    );
}