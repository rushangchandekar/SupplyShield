import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDashboardSummary, getRiskTrend } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreGauge from '../components/ScoreGauge';
import { RiskBadge, getRiskClass, getRiskColor } from '../components/RiskBadge';

const SEGMENT_ICONS = { procurement: '📦', transport: '🚛', import_export: '🌐' };
const SEGMENT_LABELS = { procurement: 'Procurement', transport: 'Transport', import_export: 'Import / Export' };

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

export default function Dashboard() {
    const { user, isPremium } = useAuth();
    const [data, setData] = useState(null);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [dashRes, trendRes] = await Promise.all([getDashboardSummary(), getRiskTrend(14)]);
            setData(dashRes.data);
            setTrend(trendRes.data.trend || []);
        } catch (err) {
            setError('Failed to load dashboard data. Make sure the backend is running.');
        } finally { setLoading(false); }
    };

    if (loading) return (<div className="loading-container"><div className="loading-spinner" /><span className="loading-text">Analyzing supply chain signals...</span></div>);
    if (error) return (<div className="loading-container"><div className="error-message">{error}</div><button className="btn btn-primary" onClick={loadData}>Retry</button></div>);

    const segments = data?.segments || {};

    return (
        <div>
            <div className="page-header">
                <h1>Supply Chain Risk Dashboard</h1>
                <p>Real-time risk intelligence across procurement, transport, and trade • <span style={{ color: 'var(--text-muted)' }}>Last computed: {new Date(data?.computed_at).toLocaleString()}</span></p>
            </div>

            {!isPremium && (
                <div className="premium-banner animate-in">
                    <div className="premium-banner-text">
                        <h3>🔓 Unlock Category-Level Insights</h3>
                        <p>Get deeper analysis for Food, Clothing, Stationery & Toys supply chains with premium.</p>
                    </div>
                    <a href="/pricing" className="btn btn-premium">Upgrade to Premium</a>
                </div>
            )}

            <div className="dashboard-grid animate-in">
                <div className="glass-card" style={{ gridColumn: 'span 1' }}>
                    <div className="glass-card-header"><span className="glass-card-title">Overall Risk</span><RiskBadge level={data?.overall_risk_level} /></div>
                    <ScoreGauge score={data?.overall_score || 0} label="Overall" />
                </div>
                {Object.entries(segments).map(([key, seg], idx) => (
                    <div key={key} className={`glass-card segment-card animate-in animate-in-delay-${idx + 1}`}>
                        <div className={`segment-icon segment-icon-${key}`}>{SEGMENT_ICONS[key]}</div>
                        <span className="segment-label">{SEGMENT_LABELS[key]}</span>
                        <div className={`segment-score ${getRiskClass(seg.score)}`}>{seg.score.toFixed(1)}</div>
                        <RiskBadge level={seg.risk_level} />
                        <div className="segment-bar"><div className="segment-bar-fill" style={{ width: `${seg.score}%`, background: getRiskColor(seg.risk_level) }} /></div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid-2 animate-in animate-in-delay-2">
                <div className="glass-card">
                    <div className="glass-card-header"><span className="glass-card-title">Risk Trend (14 Days)</span></div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="overall" stroke="#3b82f6" fill="url(#colorOverall)" name="Overall" strokeWidth={2} />
                                <Line type="monotone" dataKey="procurement" stroke="#10b981" name="Procurement" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="transport" stroke="#8b5cf6" name="Transport" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="import_export" stroke="#06b6d4" name="Import/Export" strokeWidth={1.5} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="glass-card-header"><span className="glass-card-title">Data Sources</span><span style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 600 }}>● Live</span></div>
                    {data?.signals_summary && (
                        <div>
                            {[
                                { label: 'Mandi Prices', count: data.signals_summary.mandi_records, icon: '🌾' },
                                { label: 'eNAM Markets', count: data.signals_summary.enam_records, icon: '🏪' },
                                { label: 'Weather Signals', count: data.signals_summary.weather_records, icon: '🌦️' },
                                { label: 'Trade Data', count: data.signals_summary.trade_records, icon: '📊' },
                                { label: 'Logistics', count: data.signals_summary.logistics_records, icon: '🚚' },
                            ].map((src, i) => (
                                <div key={i} className="signal-item">
                                    <div className="signal-source-icon">{src.icon}</div>
                                    <div className="signal-content"><h5>{src.label}</h5><p>{src.count} active records</p></div>
                                </div>
                            ))}
                            <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Signals</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data.signals_summary.total}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-grid-2 animate-in animate-in-delay-3">
                <div className="glass-card">
                    <div className="glass-card-header"><span className="glass-card-title">🔍 Identified Bottlenecks</span></div>
                    {data?.bottlenecks?.length > 0 ? data.bottlenecks.map((b, i) => (
                        <div key={i} className="bottleneck-card">
                            <div className="bottleneck-risk" style={{ background: `rgba(${b.combined_risk > 50 ? '244,63,94' : '249,115,22'}, 0.15)`, color: b.combined_risk > 50 ? '#f43f5e' : '#f97316' }}>{b.combined_risk.toFixed(0)}%</div>
                            <div className="bottleneck-info"><h4>{b.region}</h4><p>{b.explanations?.join(' • ') || `${b.signal_count} signals detected`}</p></div>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No significant bottlenecks detected.</p>}
                </div>

                <div className="glass-card">
                    <div className="glass-card-header"><span className="glass-card-title">💡 Recommendations</span></div>
                    {data?.recommendations?.map((rec, i) => (
                        <div key={i} className="recommendation-card">
                            <div className={`recommendation-priority priority-${rec.priority}`}>P{rec.priority}</div>
                            <div className="recommendation-content">
                                <h4>{rec.title}</h4><p>{rec.description}</p>
                                <div className="recommendation-meta">
                                    <span className="recommendation-tag">{rec.segment}</span>
                                    <span className="recommendation-tag">{rec.action_type?.replace(/_/g, ' ')}</span>
                                    {rec.estimated_impact > 0 && <span className="recommendation-tag">Impact: {rec.estimated_impact}%</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card animate-in animate-in-delay-4" style={{ marginBottom: 24 }}>
                <div className="glass-card-header"><span className="glass-card-title">Contributing Risk Factors (Explainability)</span></div>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={Object.entries(segments).map(([key, seg]) => {
                            const factors = seg.contributing_factors || {};
                            return { segment: SEGMENT_LABELS[key], ...Object.fromEntries(Object.entries(factors).map(([fk, fv]) => [fk, fv.contribution || 0])) };
                        })} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="segment" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="price_volatility" fill="#f43f5e" name="Price Volatility" stackId="a" />
                            <Bar dataKey="weather_severity" fill="#06b6d4" name="Weather" stackId="a" />
                            <Bar dataKey="logistics_delay" fill="#8b5cf6" name="Logistics Delay" stackId="a" />
                            <Bar dataKey="supply_demand_ratio" fill="#10b981" name="Supply/Demand" stackId="a" />
                            <Bar dataKey="congestion_level" fill="#f97316" name="Congestion" stackId="a" />
                            <Bar dataKey="trade_volume_change" fill="#3b82f6" name="Trade Volume" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
