import React, { useState, useEffect } from 'react';
import { getLiveSignals } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SOURCE_CONFIG = {
    mandi: { icon: '🌾', label: 'Mandi Prices', cls: 'signal-source-mandi' },
    enam: { icon: '🏪', label: 'eNAM Markets', cls: 'signal-source-enam' },
    weather: { icon: '🌦️', label: 'Weather', cls: 'signal-source-weather' },
    trade: { icon: '📊', label: 'Trade Data', cls: 'signal-source-trade' },
    logistics: { icon: '🚚', label: 'Logistics', cls: 'signal-source-logistics' },
};

export default function Signals() {
    const { isPremium } = useAuth();
    const [signals, setSignals] = useState({});
    const [activeSource, setActiveSource] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSignals();
    }, []);

    const loadSignals = async () => {
        try {
            setLoading(true);
            const res = await getLiveSignals();
            setSignals(res.data);
        } catch (err) {
            console.error('Failed to load signals:', err);
        } finally {
            setLoading(false);
        }
    };

    const visibleSources = Object.keys(signals);

    const renderSignalCard = (source, items) => {
        if (!items || !Array.isArray(items)) return null;
        const config = SOURCE_CONFIG[source] || { icon: '📡', label: source, cls: '' };

        return (
            <div key={source} className="glass-card animate-in" style={{ marginBottom: 16 }}>
                <div className="glass-card-header">
                    <span className="glass-card-title">
                        {config.icon} {config.label} ({items.length} records)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>● Live</span>
                </div>

                {source === 'mandi' || source === 'enam' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>State</th>
                                <th>{source === 'mandi' ? 'Market' : 'APMC'}</th>
                                <th>Commodity</th>
                                <th>Min ₹</th>
                                <th>Max ₹</th>
                                <th>Modal ₹</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.state}</td>
                                    <td>{item.market || item.apmc}</td>
                                    <td style={{ fontWeight: 600 }}>{item.commodity}</td>
                                    <td>₹{item.min_price?.toLocaleString()}</td>
                                    <td>₹{item.max_price?.toLocaleString()}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                                        ₹{item.modal_price?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : source === 'weather' ? (
                    <div className="dashboard-grid-3">
                        {items.map((item, i) => (
                            <div key={i} className="signal-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-between' }}>
                                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.city}</h5>
                                    <span style={{
                                        color: item.disruption_severity > 0.5 ? 'var(--accent-rose)' : item.disruption_severity > 0.2 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                    }}>
                                        {(item.disruption_severity * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                                    {item.weather_description} • {item.temperature}°C • Wind: {item.wind_speed} m/s
                                </p>
                                {item.is_disruptive && (
                                    <span style={{
                                        marginTop: 4,
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        background: 'rgba(244, 63, 94, 0.15)',
                                        color: 'var(--accent-rose)',
                                    }}>
                                        ⚠ Disruption Risk
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : source === 'trade' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Commodity</th>
                                <th>Country</th>
                                <th>Type</th>
                                <th>Quantity (MT)</th>
                                <th>Value (₹ Cr)</th>
                                <th>Change %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{item.commodity}</td>
                                    <td>{item.country}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{item.trade_type}</td>
                                    <td>{item.quantity_mt?.toLocaleString()}</td>
                                    <td>₹{item.value_inr_cr?.toLocaleString()} Cr</td>
                                    <td style={{
                                        fontWeight: 700,
                                        color: item.change_pct > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                                    }}>
                                        {item.change_pct > 0 ? '+' : ''}{item.change_pct}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : source === 'logistics' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Corridor</th>
                                <th>Mode</th>
                                <th>Delay (hrs)</th>
                                <th>Congestion</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.corridor_name}
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>{item.mode}</td>
                                    <td>{item.current_delay_hours?.toFixed(1)}h</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                                <div style={{
                                                    width: `${item.congestion_level * 100}%`,
                                                    height: '100%',
                                                    borderRadius: 2,
                                                    background: item.congestion_level > 0.5 ? '#f43f5e' : item.congestion_level > 0.3 ? '#f59e0b' : '#10b981',
                                                }} />
                                            </div>
                                            <span>{(item.congestion_level * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: item.status === 'congested' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                                            color: item.status === 'congested' ? '#f43f5e' : '#10b981',
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <pre style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', overflow: 'auto' }}>
                        {JSON.stringify(items, null, 2)}
                    </pre>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <span className="loading-text">Fetching live signals...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Live Signal Feed</h1>
                <p>Real-time data from all integrated API sources</p>
                <div className="page-header-actions">
                    <button
                        className={`btn ${activeSource === null ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setActiveSource(null)}
                    >
                        All Sources
                    </button>
                    {visibleSources.map((src) => (
                        <button
                            key={src}
                            className={`btn ${activeSource === src ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => setActiveSource(src)}
                        >
                            {SOURCE_CONFIG[src]?.icon} {SOURCE_CONFIG[src]?.label || src}
                        </button>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={loadSignals}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {!isPremium && !signals.trade && (
                <div className="premium-banner">
                    <div className="premium-banner-text">
                        <h3>🔒 Trade & Logistics Data</h3>
                        <p>Upgrade to premium for access to import/export trade and logistics corridor data.</p>
                    </div>
                    <a href="/pricing" className="btn btn-premium">Upgrade</a>
                </div>
            )}

            {visibleSources
                .filter((src) => activeSource === null || activeSource === src)
                .map((src) => renderSignalCard(src, signals[src]))}
        </div>
    );
}
