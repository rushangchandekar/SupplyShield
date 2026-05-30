import React from 'react';

const RISK_CONFIG = {
    low: { class: 'risk-badge-low', label: 'Low' },
    medium: { class: 'risk-badge-medium', label: 'Medium' },
    high: { class: 'risk-badge-high', label: 'High' },
    critical: { class: 'risk-badge-critical', label: 'Critical' },
};

export function RiskBadge({ level }) {
    const config = RISK_CONFIG[level] || RISK_CONFIG.low;
    return (
        <span className={`risk-badge ${config.class}`}>
            <span className={`risk-dot risk-dot-${level}`} />
            {config.label}
        </span>
    );
}

export function getRiskClass(score) {
    if (score >= 75) return 'risk-critical';
    if (score >= 50) return 'risk-high';
    if (score >= 25) return 'risk-medium';
    return 'risk-low';
}

export function getRiskLevel(score) {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
}

export function getRiskColor(level) {
    const colors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#f43f5e' };
    return colors[level] || colors.low;
}
