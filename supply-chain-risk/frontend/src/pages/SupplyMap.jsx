import React, { useState, useEffect, useRef } from 'react';
import { getMapData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RiskBadge, getRiskColor } from '../components/RiskBadge';

export default function SupplyMap() {
    const { isPremium } = useAuth();
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        loadMapData();
    }, []);

    useEffect(() => {
        if (mapData && !mapInstanceRef.current) {
            initMap();
        }
    }, [mapData]);

    const loadMapData = async () => {
        try {
            const res = await getMapData();
            setMapData(res.data);
        } catch (err) {
            console.error('Failed to load map data:', err);
        } finally {
            setLoading(false);
        }
    };

    const initMap = () => {
        if (!window.L || !mapRef.current) return;

        const L = window.L;
        const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([mapData.center.lat, mapData.center.lng], mapData.zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18,
        }).addTo(map);

        // Add risk points
        mapData.points?.forEach((point) => {
            const color = getRiskColor(point.risk_level);
            const size = Math.max(8, Math.min(20, point.risk_score / 5));

            const marker = L.circleMarker([point.lat, point.lng], {
                radius: size,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.4,
            }).addTo(map);

            const details = point.details || {};
            let popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 180px;">
          <h4 style="margin:0 0 8px; font-size: 14px;">${point.region}</h4>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8; font-size: 12px;">Risk Score</span>
            <span style="font-weight: 700; color: ${color}; font-size: 14px;">${point.risk_score}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #94a3b8; font-size: 12px;">Segment</span>
            <span style="font-size: 12px; text-transform: capitalize;">${point.segment}</span>
          </div>
      `;

            Object.entries(details).forEach(([key, val]) => {
                popupContent += `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: capitalize;">${key.replace(/_/g, ' ')}</span>
            <span style="font-size: 11px;">${val}</span>
          </div>
        `;
            });

            popupContent += '</div>';
            marker.bindPopup(popupContent);
        });

        // Draw corridors (premium)
        mapData.corridors?.forEach((corridor) => {
            const color = getRiskColor(corridor.risk_level);
            const line = L.polyline(
                [
                    [corridor.origin.lat, corridor.origin.lng],
                    [corridor.destination.lat, corridor.destination.lng],
                ],
                {
                    color: color,
                    weight: 3,
                    opacity: 0.6,
                    dashArray: corridor.mode === 'air' ? '8, 8' : corridor.mode === 'sea' ? '12, 6' : null,
                }
            ).addTo(map);

            line.bindPopup(`
        <div style="font-family: Inter, sans-serif;">
          <h4 style="margin:0 0 4px; font-size: 13px;">${corridor.origin.name} → ${corridor.destination.name}</h4>
          <p style="margin:0; font-size: 12px; color: #94a3b8;">
            Mode: ${corridor.mode} • Delay: ${corridor.delay?.toFixed(1)}h
          </p>
        </div>
      `);
        });

        // Legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
            const div = L.DomUtil.create('div');
            div.style.cssText = 'background: rgba(17,24,39,0.9); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: Inter, sans-serif; font-size: 11px; color: #f1f5f9;';
            div.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">Risk Level</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span> Low (0-25)</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span> Medium (25-50)</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #f97316; display: inline-block;"></span> High (50-75)</div>
        <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; border-radius: 50%; background: #f43f5e; display: inline-block;"></span> Critical (75+)</div>
      `;
            return div;
        };
        legend.addTo(map);

        mapInstanceRef.current = map;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <span className="loading-text">Loading supply chain map...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Supply Chain Network Map</h1>
                <p>
                    Geographic visualization of supply chain risk overlays across major hubs and corridors
                    {!isPremium && ' • Upgrade for corridor details'}
                </p>
            </div>

            {/* Stats row */}
            <div className="dashboard-grid animate-in" style={{ marginBottom: 20 }}>
                <div className="glass-card">
                    <div className="glass-card-title">Risk Points</div>
                    <div className="glass-card-value">{mapData?.points?.length || 0}</div>
                </div>
                <div className="glass-card">
                    <div className="glass-card-title">Active Corridors</div>
                    <div className="glass-card-value">{mapData?.corridors?.length || 0}</div>
                </div>
                <div className="glass-card">
                    <div className="glass-card-title">High Risk Zones</div>
                    <div className="glass-card-value risk-high">
                        {mapData?.points?.filter(p => p.risk_score > 50).length || 0}
                    </div>
                </div>
                <div className="glass-card">
                    <div className="glass-card-title">Coverage</div>
                    <div className="glass-card-value" style={{ color: 'var(--accent-cyan)' }}>India</div>
                </div>
            </div>

            {/* Map */}
            <div className="glass-card animate-in animate-in-delay-1" style={{ padding: 0, overflow: 'hidden' }}>
                <div ref={mapRef} className="map-container" />
            </div>

            {/* Risk Point Details Table */}
            <div className="glass-card animate-in animate-in-delay-2" style={{ marginTop: 20 }}>
                <div className="glass-card-header">
                    <span className="glass-card-title">Risk Points Detail</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Segment</th>
                            <th>Risk Score</th>
                            <th>Level</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mapData?.points?.map((p, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{p.region}</td>
                                <td style={{ textTransform: 'capitalize' }}>{p.segment}</td>
                                <td>
                                    <span className={`risk-${p.risk_level}`} style={{ fontWeight: 700 }}>
                                        {p.risk_score}%
                                    </span>
                                </td>
                                <td><RiskBadge level={p.risk_level} /></td>
                                <td style={{ fontSize: '0.8rem' }}>
                                    {Object.entries(p.details || {}).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
