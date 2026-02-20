import React from 'react';

export default function ScoreGauge({ score, label, size = 160 }) {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const offset = circumference - progress;

    const getColor = (s) => {
        if (s >= 75) return '#f43f5e';
        if (s >= 50) return '#f97316';
        if (s >= 25) return '#f59e0b';
        return '#10b981';
    };

    const getRiskClass = (s) => {
        if (s >= 75) return 'risk-critical';
        if (s >= 50) return 'risk-high';
        if (s >= 25) return 'risk-medium';
        return 'risk-low';
    };

    const color = getColor(score);

    return (
        <div className="score-gauge" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="score-gauge-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                />
                <circle
                    className="score-gauge-fill"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="score-gauge-text">
                <div className={`score-gauge-value ${getRiskClass(score)}`}>
                    {Math.round(score)}
                </div>
                <div className="score-gauge-label">{label || 'Risk Score'}</div>
            </div>
        </div>
    );
}
