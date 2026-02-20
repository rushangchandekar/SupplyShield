import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SupplyMap from './pages/SupplyMap';
import Signals from './pages/Signals';
import Categories from './pages/Categories';
import Pricing from './pages/Pricing';

export default function App() {
    return (
        <Router>
            <SignedOut>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary, #0a0a1a)',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>
                                ⚡ SupplyShield
                            </div>
                            <p style={{ color: '#94a3b8', marginTop: 8, fontSize: '1rem' }}>
                                Supply Chain Risk Intelligence Platform
                            </p>
                        </div>
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: { margin: '0 auto' },
                                    card: { background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
                                }
                            }}
                        />
                    </div>
                </div>
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
    );
}