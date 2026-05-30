import React, { useState } from 'react';
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getCategoryInsights } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreGauge from '../components/ScoreGauge';
import { RiskBadge, getRiskColor } from '../components/RiskBadge';
import { Link } from 'react-router-dom';

const CATEGORIES = [
    { name: 'Food', icon: '🍽️', desc: 'Agricultural commodities, grains, perishables', color: '#10b981' },
    { name: 'Clothing', icon: '👔', desc: 'Textiles, cotton, fabrics, garments', color: '#3b82f6' },
    { name: 'Stationery', icon: '📝', desc: 'Paper products, office supplies', color: '#8b5cf6' },
    { name: 'Toys', icon: '🧸', desc: 'Toys, games, plastic products', color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (<div className="custom-tooltip"><p className="label">{label}</p>{payload.map((p, i) => (<p key={i} className="value" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>))}</div>);
};

/* ─── CSV Export ───────────────────────────── */
function downloadCSV(categoryData) {
    const cat = categoryData.category || 'Category';
    const now = new Date().toISOString().slice(0, 10);
    let csv = `SupplyShield — ${cat} Risk Report\nGenerated: ${now}\n\n`;

    // Summary
    csv += `RISK SUMMARY\n`;
    csv += `Category,Risk Score,Risk Level,Computed At\n`;
    csv += `${cat},${categoryData.risk_score?.toFixed(2)},${categoryData.risk_level},${categoryData.computed_at || now}\n\n`;

    // Commodities tracked
    csv += `TRACKED COMMODITIES\n`;
    csv += `${(categoryData.commodities_tracked || []).join(', ')}\n\n`;

    // Contributing factors
    csv += `CONTRIBUTING RISK FACTORS\n`;
    csv += `Factor,Weight,Contribution\n`;
    Object.entries(categoryData.contributing_factors || {}).forEach(([key, val]) => {
        csv += `${key.replace(/_/g, ' ')},${((val.weight || 0) * 100).toFixed(1)}%,${(val.contribution || 0).toFixed(2)}\n`;
    });
    csv += `\n`;

    // Price data
    if (categoryData.price_data?.length) {
        csv += `COMMODITY PRICE DATA\n`;
        csv += `Commodity,State,Market,Min Price (₹),Modal Price (₹),Max Price (₹),Arrival Date\n`;
        categoryData.price_data.forEach(p => {
            csv += `${p.commodity || ''},${p.state || ''},${p.market || ''},${p.min_price || 0},${p.modal_price || 0},${p.max_price || 0},${p.arrival_date || ''}\n`;
        });
        csv += `\n`;
    }

    // Bottlenecks
    if (categoryData.bottlenecks?.length) {
        csv += `BOTTLENECKS\n`;
        csv += `Region,Combined Risk,Explanations\n`;
        categoryData.bottlenecks.forEach(b => {
            csv += `${b.region || ''},${b.combined_risk || 0},"${(b.explanations || []).join('; ')}"\n`;
        });
        csv += `\n`;
    }

    // Recommendations
    if (categoryData.recommendations?.length) {
        csv += `RECOMMENDATIONS\n`;
        csv += `Priority,Title,Action Type,Description\n`;
        categoryData.recommendations.forEach(r => {
            csv += `P${r.priority},${r.title},${r.action_type?.replace(/_/g, ' ')},"${r.description}"\n`;
        });
    }

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SupplyShield_${cat}_Report_${now}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/* ─── PDF Export ───────────────────────────── */
async function downloadPDF(categoryData) {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF('p', 'mm', 'a4');
    const cat = categoryData.category || 'Category';
    const now = new Date().toISOString().slice(0, 10);
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    // ── Header ──
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('SupplyShield', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Supply Chain Risk Intelligence Platform', 14, 26);
    doc.setFontSize(9);
    doc.text(`Report generated: ${now}`, 14, 33);
    y = 48;

    // ── Category Title ──
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${cat} — Category Risk Report`, 14, y);
    y += 10;

    // ── Risk Summary Box ──
    const riskScore = categoryData.risk_score?.toFixed(1) || '0';
    const riskLevel = (categoryData.risk_level || 'unknown').toUpperCase();
    const riskColor = riskLevel === 'LOW' ? [16, 185, 129] : riskLevel === 'MEDIUM' ? [245, 158, 11] : riskLevel === 'HIGH' ? [244, 63, 94] : [239, 68, 68];

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageW - 28, 22, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...riskColor);
    doc.text(`Risk Score: ${riskScore} / 100`, 20, y + 9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Risk Level: ${riskLevel}`, 20, y + 17);

    // Tracked commodities
    const commodities = (categoryData.commodities_tracked || []).join(', ');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tracked: ${commodities}`, pageW / 2, y + 9);
    y += 30;

    // ── Contributing Factors Table ──
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Contributing Risk Factors', 14, y);
    y += 2;

    const factorRows = Object.entries(categoryData.contributing_factors || {}).map(([key, val]) => [
        key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        `${((val.weight || 0) * 100).toFixed(1)}%`,
        (val.contribution || 0).toFixed(2),
    ]);

    doc.autoTable({
        startY: y,
        head: [['Factor', 'Weight', 'Contribution']],
        body: factorRows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 3 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── Price Data Table ──
    if (categoryData.price_data?.length) {
        if (y > 240) { doc.addPage(); y = 15; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Commodity Price Data', 14, y);
        y += 2;

        const priceRows = categoryData.price_data.map(p => [
            p.commodity || '',
            p.state || '',
            p.market || '',
            `₹${p.min_price || 0}`,
            `₹${p.modal_price || 0}`,
            `₹${p.max_price || 0}`,
            p.arrival_date || '',
        ]);

        doc.autoTable({
            startY: y,
            head: [['Commodity', 'State', 'Market', 'Min', 'Modal', 'Max', 'Date']],
            body: priceRows,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129], fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
            styles: { cellPadding: 2 },
            columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 28 }, 2: { cellWidth: 28 } },
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // ── Bottlenecks ──
    if (categoryData.bottlenecks?.length) {
        if (y > 240) { doc.addPage(); y = 15; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Identified Bottlenecks', 14, y);
        y += 2;

        const bnRows = categoryData.bottlenecks.map(b => [
            b.region || '',
            `${b.combined_risk || 0}%`,
            (b.explanations || []).join('; '),
        ]);

        doc.autoTable({
            startY: y,
            head: [['Region', 'Risk %', 'Explanations']],
            body: bnRows,
            theme: 'grid',
            headStyles: { fillColor: [244, 63, 94], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
            styles: { cellPadding: 3 },
            columnStyles: { 2: { cellWidth: 90 } },
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // ── Recommendations ──
    if (categoryData.recommendations?.length) {
        if (y > 240) { doc.addPage(); y = 15; }
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Recommendations', 14, y);
        y += 2;

        const recRows = categoryData.recommendations.map(r => [
            `P${r.priority}`,
            r.title || '',
            r.action_type?.replace(/_/g, ' ') || '',
            r.description || '',
        ]);

        doc.autoTable({
            startY: y,
            head: [['Priority', 'Title', 'Action', 'Description']],
            body: recRows,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246], fontSize: 9, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
            styles: { cellPadding: 3 },
            columnStyles: { 3: { cellWidth: 80 } },
        });
    }

    // ── Footer ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`SupplyShield — ${cat} Report — Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 8);
        doc.text('Confidential — For internal use only', pageW - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }

    doc.save(`SupplyShield_${cat}_Report_${now}.pdf`);
}

export default function Categories() {
    const { isPremium } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(null); // 'pdf' | 'csv' | null

    const handleCategoryClick = async (category) => {
        if (!isPremium) {
            setError('Category-level insights require a premium subscription. Upgrade from the Pricing page.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setSelectedCategory(category);
            const res = await getCategoryInsights(category);
            setCategoryData(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError(null);
                try {
                    const res = await fetch(`/api/dashboard/category/${category}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCategoryData(data);
                    } else {
                        setError('Failed to load category insights');
                    }
                } catch {
                    setError('Failed to load category insights');
                }
            } else {
                setError(err.response?.data?.detail || 'Failed to load category insights');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        if (!categoryData) return;
        setExporting(type);
        try {
            if (type === 'csv') {
                downloadCSV(categoryData);
            } else {
                await downloadPDF(categoryData);
            }
        } catch (err) {
            console.error(`Export ${type} failed:`, err);
        } finally {
            setTimeout(() => setExporting(null), 600);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Category Intelligence</h1>
                <p>Deep segment-level risk analysis per product category
                    {isPremium ? (
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}> • ⭐ Premium Active</span>
                    ) : (
                        <span style={{ color: 'var(--accent-amber)' }}> • Premium feature</span>
                    )}
                </p>
            </div>
            {!isPremium && (
                <div className="premium-banner animate-in">
                    <div className="premium-banner-text">
                        <h3>🔒 Premium Feature</h3>
                        <p>Category-level insights are available for premium subscribers. Upgrade now to unlock deep analysis for all 4 categories.</p>
                    </div>
                    <Link to="/pricing" className="btn btn-premium">Upgrade to Premium</Link>
                </div>
            )}
            {isPremium && !selectedCategory && (
                <div className="animate-in" style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.05))',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 12,
                    padding: '16px 24px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <span style={{ fontSize: '1.5rem' }}>✨</span>
                    <div>
                        <strong style={{ color: '#10b981' }}>Premium unlocked!</strong>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>Click any category below to see detailed risk intelligence and recommendations.</span>
                    </div>
                </div>
            )}
            {error && <div className="error-message" style={{ marginBottom: 20 }}>{error}</div>}
            <div className="category-grid animate-in">
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.name}
                        className={`glass-card category-card ${!isPremium ? 'locked' : ''} ${selectedCategory === cat.name ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick(cat.name)}
                        style={{
                            cursor: isPremium ? 'pointer' : 'not-allowed',
                            opacity: !isPremium ? 0.6 : 1,
                            borderColor: selectedCategory === cat.name ? cat.color : undefined,
                            boxShadow: selectedCategory === cat.name ? `0 0 20px ${cat.color}33` : undefined,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div className="category-icon" style={{ fontSize: '2rem' }}>{cat.icon}</div>
                        <div className="category-name">{cat.name}</div>
                        <div className="category-desc">{cat.desc}</div>
                        {!isPremium && (
                            <div style={{
                                marginTop: 8,
                                fontSize: '0.75rem',
                                color: 'var(--accent-amber)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}>🔒 Premium Required</div>
                        )}
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
            {categoryData && !loading && (
                <div className="animate-in">
                    {/* ── Export Toolbar ── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 10,
                        marginTop: 24,
                        marginBottom: 4,
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 'auto' }}>
                            📥 Export this report for offline use
                        </span>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleExport('csv')}
                            disabled={exporting === 'csv'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: exporting === 'csv' ? 'rgba(16,185,129,0.15)' : undefined,
                                borderColor: exporting === 'csv' ? '#10b981' : undefined,
                                transition: 'all 0.3s',
                            }}
                        >
                            {exporting === 'csv' ? (
                                <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Exporting...</>
                            ) : (
                                <>📄 Download CSV</>
                            )}
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleExport('pdf')}
                            disabled={exporting === 'pdf'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: exporting === 'pdf'
                                    ? 'rgba(244,63,94,0.15)'
                                    : 'linear-gradient(135deg, #ef4444, #f43f5e)',
                                borderColor: exporting === 'pdf' ? '#f43f5e' : 'transparent',
                                transition: 'all 0.3s',
                            }}
                        >
                            {exporting === 'pdf' ? (
                                <><span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Generating...</>
                            ) : (
                                <>📕 Download PDF</>
                            )}
                        </button>
                    </div>

                    <div className="dashboard-grid-2">
                        <div className="glass-card">
                            <div className="glass-card-header">
                                <span className="glass-card-title">{CATEGORIES.find(c => c.name === categoryData.category)?.icon} {categoryData.category} Risk Analysis</span>
                                <RiskBadge level={categoryData.risk_level} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
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
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Risk Level</span>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4, color: getRiskColor(categoryData.risk_level), textTransform: 'capitalize' }}>
                                            {categoryData.risk_level}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card">
                            <div className="glass-card-header"><span className="glass-card-title">Risk Factor Radar</span></div>
                            <div style={{ height: 250 }}>
                                <ResponsiveContainer>
                                    <RadarChart data={Object.entries(categoryData.contributing_factors || {}).map(([key, val]) => ({
                                        factor: key.replace(/_/g, ' '),
                                        value: val.contribution || 0,
                                        weight: (val.weight || 0) * 100
                                    }))}>
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
                    <div className="dashboard-grid-2" style={{ marginTop: 20 }}>
                        {categoryData.price_data?.length > 0 && (
                            <div className="glass-card">
                                <div className="glass-card-header"><span className="glass-card-title">📊 Price Data</span></div>
                                <div style={{ height: 250 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={categoryData.price_data.slice(0, 8)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="commodity" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="min_price" fill="#3b82f6" name="Min Price" />
                                            <Bar dataKey="modal_price" fill="#10b981" name="Modal Price" />
                                            <Bar dataKey="max_price" fill="#f43f5e" name="Max Price" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                        <div className="glass-card">
                            <div className="glass-card-header"><span className="glass-card-title">💡 Category Recommendations</span></div>
                            {categoryData.recommendations?.length > 0 ? (
                                categoryData.recommendations.map((rec, i) => (
                                    <div key={i} className="recommendation-card">
                                        <div className={`recommendation-priority priority-${rec.priority}`}>P{rec.priority}</div>
                                        <div className="recommendation-content">
                                            <h4>{rec.title}</h4>
                                            <p>{rec.description}</p>
                                            <div className="recommendation-meta">
                                                <span className="recommendation-tag">{rec.action_type?.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '12px 0' }}>No specific recommendations at this time.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
