"""
Risk Scoring Service
Orchestrates data ingestion and ML-based risk computation.
"""
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import random

from integrations.mandi_api import fetch_mandi_prices
from integrations.enam_api import fetch_enam_prices
from integrations.trade_api import fetch_trade_data
from integrations.weather_api import fetch_weather_data
from integrations.logistics_api import fetch_logistics_data
from ml.risk_model import risk_model

logger = logging.getLogger(__name__)


async def compute_all_risk_scores() -> Dict[str, Any]:
    """
    Compute risk scores across all supply chain segments by
    ingesting data from all sources.
    """
    # Fetch data from all sources
    mandi_data = await fetch_mandi_prices()
    enam_data = await fetch_enam_prices()
    trade_data = await fetch_trade_data()
    weather_data = await fetch_weather_data()
    logistics_data = await fetch_logistics_data()

    # Extract features for each segment
    procurement_features = _extract_procurement_features(mandi_data, enam_data, weather_data)
    transport_features = _extract_transport_features(logistics_data, weather_data)
    import_export_features = _extract_import_export_features(trade_data, logistics_data)

    # Compute scores
    procurement_risk = risk_model.compute_risk_score(procurement_features, "procurement")
    transport_risk = risk_model.compute_risk_score(transport_features, "transport")
    import_export_risk = risk_model.compute_risk_score(import_export_features, "import_export")

    # Overall score (weighted average)
    overall_score = (
        procurement_risk["score"] * 0.35 +
        transport_risk["score"] * 0.35 +
        import_export_risk["score"] * 0.30
    )

    # Identify bottlenecks
    all_signals = mandi_data + enam_data + trade_data + weather_data + logistics_data
    bottlenecks = risk_model.predict_bottlenecks(all_signals)

    # Generate recommendations
    recommendations = _generate_recommendations(
        procurement_risk, transport_risk, import_export_risk, bottlenecks
    )

    return {
        "overall_score": round(overall_score, 2),
        "overall_risk_level": risk_model._score_to_level(overall_score),
        "segments": {
            "procurement": procurement_risk,
            "transport": transport_risk,
            "import_export": import_export_risk,
        },
        "bottlenecks": bottlenecks,
        "recommendations": recommendations,
        "signals_summary": {
            "mandi_records": len(mandi_data),
            "enam_records": len(enam_data),
            "trade_records": len(trade_data),
            "weather_records": len(weather_data),
            "logistics_records": len(logistics_data),
            "total": len(all_signals),
        },
        "computed_at": datetime.utcnow().isoformat()
    }


async def compute_category_risk(category: str) -> Dict[str, Any]:
    """
    Compute risk scores for a specific product category.
    Premium feature - deeper segment-level analysis.
    """
    category_commodities = {
        "Food": ["Wheat", "Rice", "Onion", "Tomato", "Potato", "Soyabean"],
        "Clothing": ["Cotton", "Jute", "Silk"],
        "Stationery": ["Paper", "Stationery Items"],
        "Toys": ["Toys & Games", "Plastic Products"],
    }

    commodities = category_commodities.get(category, [])

    # Fetch category-specific data
    mandi_data = []
    for commodity in commodities[:3]:
        data = await fetch_mandi_prices(commodity=commodity)
        mandi_data.extend(data)

    enam_data = await fetch_enam_prices()
    trade_data = await fetch_trade_data()
    weather_data = await fetch_weather_data()
    logistics_data = await fetch_logistics_data()

    # Extract features
    features = _extract_procurement_features(mandi_data, enam_data, weather_data)

    # Compute risk
    risk_result = risk_model.compute_risk_score(features, "procurement")

    # Category-specific analysis
    all_signals = mandi_data + enam_data + weather_data + logistics_data
    bottlenecks = risk_model.predict_bottlenecks(all_signals)

    # Supply network data for this category
    supply_network = _build_supply_network(category, mandi_data, trade_data, logistics_data)

    return {
        "category": category,
        "risk_score": risk_result["score"],
        "risk_level": risk_result["risk_level"],
        "contributing_factors": risk_result["contributing_factors"],
        "feature_weights": risk_result["feature_weights"],
        "commodities_tracked": commodities,
        "price_data": mandi_data[:10],
        "bottlenecks": bottlenecks[:5],
        "supply_network": supply_network,
        "recommendations": _generate_category_recommendations(category, risk_result),
        "computed_at": datetime.utcnow().isoformat()
    }


def _extract_procurement_features(
    mandi_data: List[Dict],
    enam_data: List[Dict],
    weather_data: List[Dict]
) -> Dict[str, float]:
    """Extract features relevant to procurement risk."""
    # Price volatility from mandi data
    prices = [d.get("modal_price", 0) for d in mandi_data if d.get("modal_price")]
    if len(prices) > 1:
        import numpy as np
        price_volatility = float(np.std(prices) / (np.mean(prices) + 1e-6))
    else:
        price_volatility = 0.1

    # Weather severity
    weather_severities = [d.get("disruption_severity", 0) for d in weather_data]
    weather_severity = max(weather_severities) if weather_severities else 0.0

    # Supply-demand ratio
    quantities = [d.get("quantity_traded", 0) for d in enam_data if d.get("quantity_traded")]
    supply_demand = min(sum(quantities) / 5000, 1.0) if quantities else 0.5

    # Seasonal factor (based on current month)
    month = datetime.utcnow().month
    seasonal_factors = {1: 0.3, 2: 0.3, 3: 0.4, 4: 0.5, 5: 0.6, 6: 0.7,
                       7: 0.8, 8: 0.7, 9: 0.5, 10: 0.4, 11: 0.3, 12: 0.3}
    seasonal = seasonal_factors.get(month, 0.5)

    return {
        "price_volatility": min(price_volatility, 1.0),
        "weather_severity": weather_severity,
        "logistics_delay": 0.0,
        "trade_volume_change": 0.0,
        "congestion_level": 0.0,
        "supply_demand_ratio": supply_demand,
        "seasonal_factor": seasonal,
        "historical_disruption_rate": random.uniform(0.1, 0.3),
    }


def _extract_transport_features(
    logistics_data: List[Dict],
    weather_data: List[Dict]
) -> Dict[str, float]:
    """Extract features relevant to transport risk."""
    delays = [d.get("current_delay_hours", 0) for d in logistics_data]
    congestions = [d.get("congestion_level", 0) for d in logistics_data]
    weather_severities = [d.get("disruption_severity", 0) for d in weather_data]

    return {
        "price_volatility": 0.0,
        "weather_severity": max(weather_severities) if weather_severities else 0.0,
        "logistics_delay": min(max(delays) / 5.0, 1.0) if delays else 0.0,
        "trade_volume_change": 0.0,
        "congestion_level": max(congestions) if congestions else 0.0,
        "supply_demand_ratio": 0.0,
        "seasonal_factor": 0.3,
        "historical_disruption_rate": random.uniform(0.1, 0.25),
    }


def _extract_import_export_features(
    trade_data: List[Dict],
    logistics_data: List[Dict]
) -> Dict[str, float]:
    """Extract features relevant to import/export risk."""
    trade_changes = [abs(d.get("change_pct", 0)) for d in trade_data]
    delays = [d.get("current_delay_hours", 0) for d in logistics_data]
    congestions = [d.get("congestion_level", 0) for d in logistics_data]

    return {
        "price_volatility": min(max(trade_changes) / 20.0, 1.0) if trade_changes else 0.0,
        "weather_severity": 0.0,
        "logistics_delay": min(max(delays) / 5.0, 1.0) if delays else 0.0,
        "trade_volume_change": min(sum(trade_changes) / (len(trade_changes) * 15 + 1e-6), 1.0) if trade_changes else 0.0,
        "congestion_level": max(congestions) if congestions else 0.0,
        "supply_demand_ratio": 0.0,
        "seasonal_factor": 0.4,
        "historical_disruption_rate": random.uniform(0.15, 0.35),
    }


def _build_supply_network(
    category: str,
    mandi_data: List[Dict],
    trade_data: List[Dict],
    logistics_data: List[Dict]
) -> Dict[str, Any]:
    """Build supply network graph data for visualization."""
    nodes = []
    links = []

    # Source nodes (supply origins)
    regions_seen = set()
    for d in mandi_data:
        region = d.get("state", "Unknown")
        if region not in regions_seen:
            regions_seen.add(region)
            nodes.append({
                "id": f"src-{region}",
                "label": region,
                "type": "source",
                "lat": _get_state_coords(region)[0],
                "lng": _get_state_coords(region)[1],
            })

    # Hub nodes
    hubs = ["Mumbai", "Delhi", "Chennai", "Kolkata"]
    for hub in hubs:
        nodes.append({
            "id": f"hub-{hub}",
            "label": hub,
            "type": "hub",
            "lat": _get_city_coords(hub)[0],
            "lng": _get_city_coords(hub)[1],
        })

    # Trade destination nodes
    for d in trade_data[:3]:
        country = d.get("country", "Unknown")
        nodes.append({
            "id": f"dest-{country}",
            "label": country,
            "type": "destination",
            "lat": 0, "lng": 0,
        })

    # Links
    for region in regions_seen:
        hub = random.choice(hubs)
        links.append({
            "source": f"src-{region}",
            "target": f"hub-{hub}",
            "risk_level": random.choice(["low", "medium", "high"]),
        })

    for d in trade_data[:3]:
        hub = random.choice(hubs)
        country = d.get("country", "Unknown")
        links.append({
            "source": f"hub-{hub}",
            "target": f"dest-{country}",
            "risk_level": random.choice(["low", "medium", "high"]),
        })

    return {"nodes": nodes, "links": links}


def _generate_recommendations(
    procurement_risk: Dict,
    transport_risk: Dict,
    import_export_risk: Dict,
    bottlenecks: List[Dict]
) -> List[Dict[str, Any]]:
    """Generate contingency recommendations based on risk analysis."""
    recommendations = []

    if procurement_risk["score"] > 50:
        recommendations.append({
            "segment": "procurement",
            "action_type": "increase_inventory",
            "title": "Increase Buffer Inventory",
            "description": f"Procurement risk is {procurement_risk['risk_level']} (score: {procurement_risk['score']}). "
                         f"Consider increasing safety stock by 15-25% for critical commodities to mitigate supply disruptions.",
            "priority": 4 if procurement_risk["score"] > 70 else 3,
            "estimated_impact": round(procurement_risk["score"] * 0.3, 1),
        })
        recommendations.append({
            "segment": "procurement",
            "action_type": "diversify_suppliers",
            "title": "Diversify Supplier Base",
            "description": "High price volatility detected across procurement channels. "
                         "Identify and onboard 2-3 alternative suppliers in different regions to reduce concentration risk.",
            "priority": 3,
            "estimated_impact": round(procurement_risk["score"] * 0.25, 1),
        })

    if transport_risk["score"] > 40:
        recommendations.append({
            "segment": "transport",
            "action_type": "switch_routes",
            "title": "Activate Alternate Transport Routes",
            "description": f"Transport risk is elevated (score: {transport_risk['score']}). "
                         f"Consider switching to less congested corridors or alternative transport modes.",
            "priority": 4 if transport_risk["score"] > 60 else 2,
            "estimated_impact": round(transport_risk["score"] * 0.2, 1),
        })

    if import_export_risk["score"] > 45:
        recommendations.append({
            "segment": "import_export",
            "action_type": "hedge_procurement",
            "title": "Hedge Import Costs",
            "description": f"Import/Export risk score: {import_export_risk['score']}. "
                         f"Recommend forward contracts or currency hedging to mitigate trade volatility.",
            "priority": 3,
            "estimated_impact": round(import_export_risk["score"] * 0.15, 1),
        })

    for bottleneck in bottlenecks[:3]:
        if bottleneck["combined_risk"] > 30:
            recommendations.append({
                "segment": "transport",
                "action_type": "alternative_sourcing",
                "title": f"Address Bottleneck: {bottleneck['region']}",
                "description": f"Bottleneck detected in {bottleneck['region']} region "
                             f"(risk: {bottleneck['combined_risk']}%). "
                             f"Factors: {', '.join(bottleneck['explanations'])}",
                "priority": 5 if bottleneck["combined_risk"] > 60 else 3,
                "estimated_impact": round(bottleneck["combined_risk"] * 0.2, 1),
            })

    if not recommendations:
        recommendations.append({
            "segment": "general",
            "action_type": "increase_inventory",
            "title": "Maintain Current Strategy",
            "description": "All risk scores are within acceptable thresholds. "
                         "Continue monitoring and maintain current inventory levels.",
            "priority": 1,
            "estimated_impact": 0,
        })

    recommendations.sort(key=lambda x: x["priority"], reverse=True)
    return recommendations


def _generate_category_recommendations(
    category: str,
    risk_result: Dict
) -> List[Dict[str, Any]]:
    """Generate category-specific recommendations."""
    recommendations = []
    score = risk_result["score"]

    category_actions = {
        "Food": [
            ("increase_inventory", "Increase Cold Storage Capacity",
             "Perishable food items require increased cold storage allocation during high-risk periods."),
            ("diversify_suppliers", "Source from Multiple Agricultural Regions",
             "Diversify food sourcing across states to reduce weather-related procurement risk."),
        ],
        "Clothing": [
            ("alternative_sourcing", "Identify Alternative Textile Sources",
             "Source raw materials (cotton, jute) from multiple regions to hedge against crop failures."),
            ("expedite_shipping", "Pre-position Seasonal Inventory",
             "Expedite shipments for seasonal clothing lines before monsoon-induced logistics delays."),
        ],
        "Stationery": [
            ("increase_inventory", "Build Pre-Season Stock",
             "Increase inventory before school/academic season to avoid supply shortages."),
            ("switch_routes", "Optimize Import Routes",
             "Switch to Southern port routes if Northern corridors show congestion."),
        ],
        "Toys": [
            ("hedge_procurement", "Lock Import Prices",
             "Secure forward contracts for imported toy components to hedge against currency fluctuations."),
            ("diversify_suppliers", "Expand Domestic Manufacturing",
             "Reduce dependency on imports by partnering with domestic toy manufacturers."),
        ],
    }

    actions = category_actions.get(category, [])
    for action_type, title, desc in actions:
        priority = 4 if score > 60 else (3 if score > 40 else 2)
        recommendations.append({
            "segment": "procurement",
            "category": category,
            "action_type": action_type,
            "title": title,
            "description": desc,
            "priority": priority,
            "estimated_impact": round(score * 0.2, 1),
        })

    return recommendations


def _get_state_coords(state: str) -> tuple:
    """Get approximate lat/lng for Indian states."""
    coords = {
        "Maharashtra": (19.7515, 75.7139),
        "Uttar Pradesh": (26.8467, 80.9462),
        "Madhya Pradesh": (22.9734, 78.6569),
        "Rajasthan": (27.0238, 74.2179),
        "Gujarat": (22.2587, 71.1924),
        "Karnataka": (15.3173, 75.7139),
        "Tamil Nadu": (11.1271, 78.6569),
        "Andhra Pradesh": (15.9129, 79.7400),
        "Punjab": (31.1471, 75.3412),
        "West Bengal": (22.9868, 87.8550),
        "Telangana": (18.1124, 79.0193),
        "Delhi": (28.7041, 77.1025),
    }
    return coords.get(state, (20.5937, 78.9629))


def _get_city_coords(city: str) -> tuple:
    coords = {
        "Mumbai": (19.076, 72.877),
        "Delhi": (28.704, 77.102),
        "Chennai": (13.083, 80.271),
        "Kolkata": (22.573, 88.364),
        "Bangalore": (12.972, 77.595),
    }
    return coords.get(city, (20.5937, 78.9629))
