import React, { useState } from 'react';
import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getCategoryInsights } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreGauge from '../components/ScoreGauge';
import { RiskBadge, getRiskColor } from '../components/RiskBadge';

const CATEGORIES = [
    { name: 'Food', icon: '🍽️', desc: 'Agricultural commodities, grains, perishables', color: '#10b981' },
    { name: 'Clothing', icon: '👔', desc: 'Textiles, cotton, fabrics, garments', color: '#3b82f6' },
    { name: 'Stationery', icon: '📝', desc: 'Paper products, office supplies', color: '#8b5cf6' },
    { name: 'Toys', icon: '🧸', desc: 'Toys, games, plastic products', color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <p className="label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="value" style={{ color: p.color }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
};

export default function Categories() {
    const { isPremium } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCategoryClick = async (category) => {
        if (!isPremium) {
            setError('Category-level insights require a premium subscription. Upgrade to access detailed analysis.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setSelectedCategory(category);
            const res = await getCategoryInsights(category);
            setCategoryData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load category insights');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Category Intelligence</h1>
                <p>
                    Deep segment-level risk analysis per product category
                    {!isPremium && ' • Premium feature'}
                </p>
            </div>

            {!isPremium && (
                <div className="premium-banner animate-in">
                    <div className="premium-banner-text">
                        <h3>🔒 Premium Feature</h3>
                        <p>Category-level insights are available for premium subscribers. Get deep analysis for each product category.</p>
                    </div>
                    <a href="/pricing" className="btn btn-premium">Upgrade to Premium</a>
                </div>
            )}

            {error && (
                <div className="error-message" style={{ marginBottom: 20 }}>{error}</div>
            )}

            {/* Category Cards */}
            <div className="category-grid animate-in">
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.name}
                        className={`glass-card category-card ${!isPremium ? 'locked' : ''}`}
                        onClick={() => handleCategoryClick(cat.name)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="category-icon">{cat.icon}</div>
                        <div className="category-name">{cat.name}</div>
                        <div className="category-desc">{cat.desc}</div>
                        {selectedCategory === cat.name && categoryData && (
                            <div style={{ marginTop: 12 }}>
                                <RiskBadge level={categoryData.risk_level} />
                                <div style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 800, color: getRiskColor(categoryData.risk_level) }}>
                                    {categoryData.risk_score?.toFixed(1)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <span className="loading-text">Analyzing {selectedCategory} supply chain...</span>
                </div>
            )}

            {/* Detailed Category View */}
            {categoryData && !loading && (
                <div className="animate-in">
                    {/* Score + Contributing Factors */}
                    <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
                        <div className="glass-card">
                            <div className="glass-card-header">
                                <span className="glass-card-title">
                                    {CATEGORIES.find(c => c.name === categoryData.category)?.icon}{' '}
                                    {categoryData.category} Risk Analysis
                                </span>
                                <RiskBadge level={categoryData.risk_level} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                                <ScoreGauge score={categoryData.risk_score} label={categoryData.category} />
                                <div>
                                    <div style={{ marginBottom: 12 }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tracked Commodities</span>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                                            {categoryData.commodities_tracked?.map((c, i) => (
                                                <span key={i} className="recommendation-tag">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Weights Radar */}
                        <div className="glass-card">
                            <div className="glass-card-header">
                                <span className="glass-card-title">Risk Factor Radar</span>
                            </div>
                            <div style={{ height: 250 }}>
                                <ResponsiveContainer>
                                    <RadarChart
                                        data={Object.entries(categoryData.contributing_factors || {}).map(([key, val]) => ({
                                            factor: key.replace(/_/g, ' '),
                                            value: val.contribution || 0,
                                            weight: (val.weight || 0) * 100,
                                        }))}
                                    >
                                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                        <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <PolarRadiusAxis tick={{ fontSize: 10 }} />
                                        <Radar name="Contribution" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Price Data + Recommendations */}
                    <div className="dashboard-grid-2" style={{ marginTop: 20 }}>
                        {/* Price Data */}
                        {categoryData.price_data?.length > 0 && (
                            <div className="glass-card">
                                <div className="glass-card-header">
                                    <span className="glass-card-title">Price Data</span>
                                </div>
                                <div style={{ height: 250 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={categoryData.price_data.slice(0, 8)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="commodity" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="min_price" fill="#3b82f6" name="Min Price" />
                                            <Bar dataKey="modal_price" fill="#10b981" name="Modal Price" />
                                            <Bar dataKey="max_price" fill="#f43f5e" name="Max Price" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Category Recommendations */}
                        <div className="glass-card">
                            <div className="glass-card-header">
                                <span className="glass-card-title">💡 Category Recommendations</span>
                            </div>
                            {categoryData.recommendations?.map((rec, i) => (
                                <div key={i} className="recommendation-card">
                                    <div className={`recommendation-priority priority-${rec.priority}`}>
                                        P{rec.priority}
                                    </div>
                                    <div className="recommendation-content">
                                        <h4>{rec.title}</h4>
                                        <p>{rec.description}</p>
                                        <div className="recommendation-meta">
                                            <span className="recommendation-tag">{rec.action_type?.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottlenecks */}
                    {categoryData.bottlenecks?.length > 0 && (
                        <div className="glass-card" style={{ marginTop: 20 }}>
                            <div className="glass-card-header">
                                <span className="glass-card-title">🔍 Category Bottlenecks</span>
                            </div>
                            <div className="dashboard-grid-3">
                                {categoryData.bottlenecks.map((b, i) => (
                                    <div key={i} className="bottleneck-card">
                                        <div
                                            className="bottleneck-risk"
                                            style={{
                                                background: `rgba(${b.combined_risk > 50 ? '244,63,94' : '249,115,22'}, 0.15)`,
                                                color: b.combined_risk > 50 ? '#f43f5e' : '#f97316',
                                            }}
                                        >
                                            {b.combined_risk.toFixed(0)}%
                                        </div>
                                        <div className="bottleneck-info">
                                            <h4>{b.region}</h4>
                                            <p>{b.signal_count} signals</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
