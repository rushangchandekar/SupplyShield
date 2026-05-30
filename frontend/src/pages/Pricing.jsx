import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const { user, isPremium, upgradeToPremium, downgradeToFree } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const handleUpgrade = async () => {
        setLoading(true);
        // Simulate a short processing delay for UX
        await new Promise(resolve => setTimeout(resolve, 1200));
        upgradeToPremium();
        setLoading(false);
        setShowSuccess(true);
        // Redirect to categories after a brief success message
        setTimeout(() => {
            navigate('/categories');
        }, 1500);
    };

    const handleDowngrade = () => {
        downgradeToFree();
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
            {showSuccess && (
                <div className="animate-in" style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: 16,
                    padding: '24px 32px',
                    marginBottom: 32,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                    <h3 style={{ color: '#10b981', fontWeight: 800, fontSize: '1.3rem', marginBottom: 4 }}>Welcome to Premium!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Redirecting you to Category Intelligence...</p>
                </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: 48 }} className="animate-in">
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Choose Your Plan</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 12, maxWidth: 600, margin: '12px auto 0' }}>Get the supply chain intelligence you need. Start free, upgrade when you need deeper insights.</p>
            </div>
            <div className="pricing-grid animate-in animate-in-delay-1">
                <div className="glass-card pricing-card">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free</div>
                    <div className="pricing-price">₹0 <span>/month</span></div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Perfect for getting started with supply chain monitoring</p>
                    <ul className="pricing-features">
                        <li>Macro supply risk dashboard</li><li>Overall risk score</li><li>Segment-level overview</li><li>Mandi & eNAM price feeds</li><li>Weather disruption signals</li><li>Basic recommendations</li><li>7-day risk trend</li>
                        <li className="disabled">Category-level insights</li><li className="disabled">Trade & logistics raw data</li><li className="disabled">Supply network corridors</li><li className="disabled">Deep bottleneck analysis</li>
                    </ul>
                    {!isPremium ? (
                        <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.6 }}>Current Plan</button>
                    ) : (
                        <button className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDowngrade}>Switch to Free</button>
                    )}
                </div>
                <div className="glass-card pricing-card featured">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⭐ Premium</span></div>
                    <div className="pricing-price">₹2,999 <span>/month</span></div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full supply chain intelligence with category-level analysis</p>
                    <ul className="pricing-features">
                        <li>Everything in Free</li><li>Category-level insights (Food, Clothing, Stationery, Toys)</li><li>Deep segment-level risk analysis</li><li>Import/Export trade data access</li><li>Logistics corridor monitoring</li><li>Supply network corridor visualization</li><li>Advanced bottleneck detection</li><li>Category-specific recommendations</li><li>Radar chart risk factor analysis</li><li>Full recommendation engine</li><li>Priority support</li>
                    </ul>
                    {isPremium ? (
                        <button className="btn btn-secondary btn-lg" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.6 }}>
                            ✅ Current Plan
                        </button>
                    ) : (
                        <button className="btn btn-premium btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleUpgrade} disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                    <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                    Processing...
                                </span>
                            ) : 'Upgrade Now — Free Trial'}
                        </button>
                    )}
                </div>
            </div>
            <div className="glass-card animate-in animate-in-delay-2" style={{ marginTop: 48 }}>
                <div className="glass-card-header"><span className="glass-card-title">Feature Comparison</span></div>
                <table className="data-table">
                    <thead><tr><th>Feature</th><th style={{ textAlign: 'center' }}>Free</th><th style={{ textAlign: 'center' }}>Premium</th></tr></thead>
                    <tbody>
                        {[['Overall Risk Dashboard', true, true], ['Segment Scores (3 segments)', true, true], ['Risk Trend Charts', true, true], ['Mandi & eNAM Price Feeds', true, true], ['Weather Disruption Signals', true, true], ['Basic Recommendations (Top 3)', true, true], ['Category-Level Analysis', false, true], ['Import/Export Trade Data', false, true], ['Logistics Corridor Data', false, true], ['Supply Network Map Corridors', false, true], ['Advanced Bottleneck Detection', false, true], ['Category Recommendations', false, true], ['Radar Factor Analysis', false, true], ['Full Recommendation Engine', false, true]].map(([feature, free, premium], i) => (<tr key={i}><td>{feature}</td><td style={{ textAlign: 'center', fontSize: '1.1rem' }}>{free ? '✅' : '❌'}</td><td style={{ textAlign: 'center', fontSize: '1.1rem' }}>{premium ? '✅' : '❌'}</td></tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
