import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SupplyMap from './pages/SupplyMap';
import Signals from './pages/Signals';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-layout">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/map" element={<SupplyMap />} />
                            <Route path="/signals" element={<Signals />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
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
            </Router>
        </AuthProvider>
    );
}
