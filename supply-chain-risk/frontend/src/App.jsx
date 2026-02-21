import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AppFooter from './components/AppFooter';
import SignInPage from './components/SignInPage';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './pages/Dashboard';
import SupplyMap from './pages/SupplyMap';
import Signals from './pages/Signals';
import Categories from './pages/Categories';
import Pricing from './pages/Pricing';

export default function App() {
    return (
        <ThemeProvider>
            <Router>
                <ClerkLoading>
                    <LoadingScreen />
                </ClerkLoading>
                <ClerkLoaded>
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
                                <AppFooter />
                            </div>
                        </AuthProvider>
                    </SignedIn>
                </ClerkLoaded>
            </Router>
        </ThemeProvider>
    );
}