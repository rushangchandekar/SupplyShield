import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Scroll-reveal hook ────────────────────────── */
function useScrollReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('revealed');
                    obs.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

function RevealSection({ children, className = '', delay = 0 }) {
    const ref = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`reveal-on-scroll ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ─── Animated counter ──────────────────────────── */
function AnimatedStat({ value, suffix = '', label }) {
    const ref = useRef(null);
    const numRef = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    animateValue(numRef.current, 0, parseInt(value), 1800);
                    obs.unobserve(el);
                }
            },
            { threshold: 0.3 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [value]);

    function animateValue(el, start, end, duration) {
        let startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(ease * (end - start) + start);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    return (
        <div ref={ref} className="landing-stat">
            <div className="landing-stat-value">
                <span ref={numRef}>0</span>{suffix}
            </div>
            <div className="landing-stat-label">{label}</div>
        </div>
    );
}

/* ─── Floating particles (decorative) ───────────── */
function FloatingParticles() {
    return (
        <div className="landing-particles" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className="landing-particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                        animationDuration: `${15 + Math.random() * 25}s`,
                        animationDelay: `${Math.random() * 10}s`,
                        opacity: 0.15 + Math.random() * 0.25,
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
    const navigate = useNavigate();
    const goToLogin = () => navigate('/login');

    return (
        <div className="landing-root">
            {/* ─── NAVBAR ─────────────────────────── */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="landing-nav-brand">
                        <div className="brand-icon">⚡</div>
                        <span>SupplyShield</span>
                    </div>
                    <div className="landing-nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#data-sources">Data</a>
                        <a href="#pricing">Pricing</a>
                    </div>
                    <div className="landing-nav-actions">
                        <button className="btn btn-secondary btn-sm" onClick={goToLogin}>Sign In</button>
                        <button className="btn btn-primary btn-sm" onClick={goToLogin}>Get Started Free</button>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ───────────────────────────── */}
            <section className="landing-hero">
                <FloatingParticles />
                <div className="landing-hero-blob landing-hero-blob-1" />
                <div className="landing-hero-blob landing-hero-blob-2" />
                <div className="landing-hero-blob landing-hero-blob-3" />

                <div className="landing-hero-content">
                    <div className="landing-hero-badge">
                        <span className="landing-hero-badge-dot" />
                        Powered by Real-Time Government Data
                    </div>

                    <h1 className="landing-hero-title">
                        Supply Chain<br />
                        <span className="gradient-text">Risk Intelligence</span>
                    </h1>

                    <p className="landing-hero-subtitle">
                        Predict disruptions before they happen. Monitor procurement, transport, and trade
                        corridors across India with ML-powered risk scoring, live data feeds, and
                        actionable contingency recommendations.
                    </p>

                    <div className="landing-hero-cta">
                        <button className="btn btn-primary btn-lg" onClick={goToLogin}>
                            Start Monitoring Free →
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Explore Features
                        </button>
                    </div>

                    <div className="landing-hero-trust">
                        <span>Built for India's supply chain ecosystem</span>
                        <span className="landing-hero-trust-divider">•</span>
                        <span>10 hubs monitored</span>
                        <span className="landing-hero-trust-divider">•</span>
                        <span>6 logistics corridors</span>
                    </div>
                </div>

                {/* Hero visual — animated risk dashboard mockup */}
                <div className="landing-hero-visual">
                    <div className="landing-hero-card landing-hero-card-main">
                        <div className="landing-hero-card-header">
                            <div className="landing-hero-card-dot" style={{ background: '#f43f5e' }} />
                            <div className="landing-hero-card-dot" style={{ background: '#f59e0b' }} />
                            <div className="landing-hero-card-dot" style={{ background: '#10b981' }} />
                            <span style={{ marginLeft: 12, fontSize: '0.7rem', color: 'var(--text-muted)' }}>SupplyShield Dashboard</span>
                        </div>
                        <div className="landing-hero-gauge-row">
                            {/* Animated SVG gauge */}
                            <div className="landing-mini-gauge">
                                <svg viewBox="0 0 120 120" width="110" height="110">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gaugeGrad)" strokeWidth="8"
                                        strokeLinecap="round" strokeDasharray="314" strokeDashoffset="95"
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 2s ease' }} />
                                    <defs>
                                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="landing-mini-gauge-text">
                                    <span className="landing-mini-gauge-value">68</span>
                                    <span className="landing-mini-gauge-label">Risk Score</span>
                                </div>
                            </div>
                            <div className="landing-hero-segments">
                                {[
                                    { name: 'Procurement', score: 62, color: '#f59e0b', width: '62%' },
                                    { name: 'Transport', score: 74, color: '#f97316', width: '74%' },
                                    { name: 'Import/Export', score: 45, color: '#10b981', width: '45%' },
                                ].map(seg => (
                                    <div key={seg.name} className="landing-hero-seg">
                                        <div className="landing-hero-seg-head">
                                            <span>{seg.name}</span>
                                            <span style={{ color: seg.color, fontWeight: 800 }}>{seg.score}</span>
                                        </div>
                                        <div className="landing-hero-seg-bar">
                                            <div className="landing-hero-seg-fill" style={{ width: seg.width, background: seg.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating mini cards */}
                    <div className="landing-hero-float landing-hero-float-1">
                        <span className="landing-hero-float-icon">🌦️</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>Weather Alert</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Heavy rain — Mumbai hub</div>
                        </div>
                    </div>
                    <div className="landing-hero-float landing-hero-float-2">
                        <span className="landing-hero-float-icon">📈</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>Wheat +12%</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mandi price surge</div>
                        </div>
                    </div>
                    <div className="landing-hero-float landing-hero-float-3">
                        <span className="landing-hero-float-icon">🚚</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>Corridor Delay</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Delhi–Mumbai +4.2h</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── STATS ──────────────────────────── */}
            <section className="landing-stats">
                <div className="landing-stats-inner">
                    <AnimatedStat value="5" suffix="+" label="Data Sources" />
                    <div className="landing-stats-divider" />
                    <AnimatedStat value="10" suffix="" label="Hubs Monitored" />
                    <div className="landing-stats-divider" />
                    <AnimatedStat value="6" suffix="" label="Logistics Corridors" />
                    <div className="landing-stats-divider" />
                    <AnimatedStat value="100" suffix="%" label="Real-Time Scoring" />
                </div>
            </section>

            {/* ─── FEATURES ───────────────────────── */}
            <section id="features" className="landing-section">
                <RevealSection className="landing-section-header">
                    <div className="landing-section-label">Features</div>
                    <h2>Everything you need to<br /><span className="gradient-text">stay ahead of disruptions</span></h2>
                    <p>Comprehensive risk intelligence powered by ML and live government data feeds</p>
                </RevealSection>

                <div className="landing-features-grid">
                    {[
                        {
                            icon: '📊', title: 'Risk Dashboard',
                            desc: 'Real-time risk gauges for overall, procurement, transport, and import/export segments with 14-day trend analysis.',
                            color: '#3b82f6'
                        },
                        {
                            icon: '🗺️', title: 'Interactive Supply Map',
                            desc: 'Leaflet-powered map with color-coded risk markers for 10 major hubs and transport corridor overlays.',
                            color: '#06b6d4'
                        },
                        {
                            icon: '📡', title: 'Live Data Signals',
                            desc: 'Filterable feeds from Mandi prices, eNAM markets, weather services, trade statistics, and logistics APIs.',
                            color: '#8b5cf6'
                        },
                        {
                            icon: '🤖', title: 'ML Risk Predictions',
                            desc: 'Ensemble of Random Forest + Gradient Boosting models with explainable feature contributions and importance.',
                            color: '#10b981'
                        },
                        {
                            icon: '🔍', title: 'Bottleneck Detection',
                            desc: 'Multi-factor analysis identifies supply chain chokepoints with severity scoring and root cause explanations.',
                            color: '#f59e0b'
                        },
                        {
                            icon: '💡', title: 'Smart Recommendations',
                            desc: 'Priority-ranked contingency actions — increase inventory, diversify suppliers, switch routes — tailored to your risk profile.',
                            color: '#f43f5e'
                        },
                    ].map((f, i) => (
                        <RevealSection key={f.title} delay={i * 80} className="landing-feature-card glass-card">
                            <div className="landing-feature-icon" style={{ background: `${f.color}15`, borderColor: `${f.color}25` }}>
                                <span>{f.icon}</span>
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            <div className="landing-feature-glow" style={{ background: f.color }} />
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── HOW IT WORKS ───────────────────── */}
            <section id="how-it-works" className="landing-section landing-section-alt">
                <RevealSection className="landing-section-header">
                    <div className="landing-section-label">How It Works</div>
                    <h2>From raw data to<br /><span className="gradient-text">actionable intelligence</span></h2>
                    <p>Three steps to proactive supply chain risk management</p>
                </RevealSection>

                <div className="landing-steps">
                    {[
                        {
                            num: '01', title: 'Ingest',
                            desc: 'Live feeds from data.gov.in, eNAM, OpenWeatherMap, and logistics APIs flow into our pipeline every minute.',
                            icon: '📥', color: '#3b82f6'
                        },
                        {
                            num: '02', title: 'Analyze',
                            desc: 'ML ensemble models process commodity prices, weather severity, trade volumes, and corridor congestion into risk scores.',
                            icon: '⚙️', color: '#8b5cf6'
                        },
                        {
                            num: '03', title: 'Act',
                            desc: 'Get prioritized recommendations: reroute shipments, buffer inventory, diversify suppliers — before disruptions hit.',
                            icon: '🚀', color: '#06b6d4'
                        },
                    ].map((s, i) => (
                        <RevealSection key={s.num} delay={i * 120} className="landing-step">
                            <div className="landing-step-num" style={{ background: `${s.color}12`, color: s.color, borderColor: `${s.color}30` }}>{s.num}</div>
                            <div className="landing-step-icon">{s.icon}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                            {i < 2 && <div className="landing-step-connector" />}
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── DATA SOURCES ───────────────────── */}
            <section id="data-sources" className="landing-section">
                <RevealSection className="landing-section-header">
                    <div className="landing-section-label">Data Sources</div>
                    <h2>Powered by <span className="gradient-text">authoritative data</span></h2>
                    <p>Government APIs, weather services, and enterprise logistics feeds</p>
                </RevealSection>

                <div className="landing-sources">
                    {[
                        { icon: '🌾', name: 'data.gov.in', desc: 'Mandi commodity prices', tag: 'Daily' },
                        { icon: '🏪', name: 'eNAM Portal', desc: 'APMC market feeds', tag: 'Daily' },
                        { icon: '🌦️', name: 'OpenWeatherMap', desc: '10 hub weather data', tag: 'Real-time' },
                        { icon: '📦', name: 'Trade Statistics', desc: 'Import/export volumes', tag: 'Monthly' },
                        { icon: '🚛', name: 'Logistics APIs', desc: 'Corridor delays & congestion', tag: 'Real-time' },
                    ].map((src, i) => (
                        <RevealSection key={src.name} delay={i * 60} className="landing-source-card glass-card">
                            <div className="landing-source-icon">{src.icon}</div>
                            <div className="landing-source-info">
                                <h4>{src.name}</h4>
                                <p>{src.desc}</p>
                            </div>
                            <span className="landing-source-tag">{src.tag}</span>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── PRICING ────────────────────────── */}
            <section id="pricing" className="landing-section landing-section-alt">
                <RevealSection className="landing-section-header">
                    <div className="landing-section-label">Pricing</div>
                    <h2>Start free, <span className="gradient-text">upgrade when ready</span></h2>
                    <p>No credit card required. Full dashboard access on the free plan.</p>
                </RevealSection>

                <div className="landing-pricing-grid">
                    <RevealSection className="landing-pricing-card glass-card">
                        <div className="landing-pricing-tier">Free</div>
                        <div className="landing-pricing-price">₹0<span>/forever</span></div>
                        <p className="landing-pricing-desc">Perfect for getting started with supply chain monitoring</p>
                        <ul className="landing-pricing-features">
                            <li>Overall risk dashboard</li>
                            <li>3 segment scores</li>
                            <li>14-day risk trend charts</li>
                            <li>Mandi & eNAM price feeds</li>
                            <li>Weather disruption signals</li>
                            <li>Top 3 recommendations</li>
                            <li>Interactive supply map</li>
                            <li className="disabled">Category-level insights</li>
                            <li className="disabled">Trade data analytics</li>
                            <li className="disabled">Logistics corridor data</li>
                        </ul>
                        <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} onClick={goToLogin}>
                            Get Started Free
                        </button>
                    </RevealSection>

                    <RevealSection delay={100} className="landing-pricing-card landing-pricing-featured glass-card">
                        <div className="landing-pricing-popular">Most Popular</div>
                        <div className="landing-pricing-tier">Premium</div>
                        <div className="landing-pricing-price">₹2,999<span>/month</span></div>
                        <p className="landing-pricing-desc">Full intelligence suite for serious supply chain operators</p>
                        <ul className="landing-pricing-features">
                            <li>Everything in Free</li>
                            <li>Category insights (Food, Clothing, Stationery, Toys)</li>
                            <li>Import/export trade data</li>
                            <li>Logistics corridor visualization</li>
                            <li>Advanced bottleneck detection</li>
                            <li>Radar risk analysis</li>
                            <li>Unlimited recommendations</li>
                            <li>ML explainability scores</li>
                            <li>Map corridor overlays</li>
                            <li>Priority support</li>
                        </ul>
                        <button className="btn btn-premium btn-lg" style={{ width: '100%' }} onClick={goToLogin}>
                            Start Premium Trial →
                        </button>
                    </RevealSection>
                </div>
            </section>

            {/* ─── FINAL CTA ─────────────────────── */}
            <section className="landing-cta">
                <div className="landing-cta-blob" />
                <RevealSection className="landing-cta-content">
                    <h2>Ready to protect your supply chain?</h2>
                    <p>
                        Join businesses across India using SupplyShield to predict disruptions,
                        reduce risk, and maintain operational resilience.
                    </p>
                    <div className="landing-cta-buttons">
                        <button className="btn btn-primary btn-lg" onClick={goToLogin}>
                            Start Monitoring Free →
                        </button>
                    </div>
                    <div className="landing-cta-footnote">
                        No credit card required • Free tier forever • Upgrade anytime
                    </div>
                </RevealSection>
            </section>

            {/* ─── FOOTER ────────────────────────── */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-footer-brand">
                        <div className="landing-footer-logo">
                            <div className="brand-icon" style={{ width: 28, height: 28, fontSize: '0.8rem', borderRadius: 8 }}>⚡</div>
                            <span>SupplyShield</span>
                        </div>
                        <p>Predict. Protect. Prosper.</p>
                    </div>

                    <div className="landing-footer-links">
                        <div className="landing-footer-col">
                            <h5>Product</h5>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#how-it-works">How It Works</a>
                        </div>
                        <div className="landing-footer-col">
                            <h5>Data</h5>
                            <a href="#data-sources">Data Sources</a>
                            <a href="#features">Risk Scoring</a>
                            <a href="#features">ML Models</a>
                        </div>
                        <div className="landing-footer-col">
                            <h5>Hubs</h5>
                            <span>Mumbai</span>
                            <span>Delhi</span>
                            <span>Chennai</span>
                            <span>Bangalore</span>
                        </div>
                    </div>
                </div>

                <div className="landing-footer-bottom">
                    <p>© 2026 SupplyShield — Supply Chain Risk Intelligence Platform</p>
                    <p>Data: data.gov.in • eNAM • OpenWeatherMap • Enterprise Logistics APIs</p>
                </div>
            </footer>
        </div>
    );
}
