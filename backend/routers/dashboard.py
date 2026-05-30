"""Dashboard & Risk API Router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import random

from database import get_db
from models.user import User
from services.auth_service import get_current_user, is_premium_user
from services.risk_service import compute_all_risk_scores, compute_category_risk
from integrations.mandi_api import fetch_mandi_prices
from integrations.enam_api import fetch_enam_prices
from integrations.trade_api import fetch_trade_data
from integrations.weather_api import fetch_weather_data
from integrations.logistics_api import fetch_logistics_data

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_dashboard_summary(user: Optional[User] = Depends(get_current_user)):
    result = await compute_all_risk_scores()
    if not is_premium_user(user):
        result["recommendations"] = result.get("recommendations", [])[:3]
        result["bottlenecks"] = result.get("bottlenecks", [])[:3]
    return result


@router.get("/category/{category}")
async def get_category_insights(category: str, user: Optional[User] = Depends(get_current_user)):
    # For demo/hackathon: allow category insights without strict auth check
    # Premium gating is handled on the frontend via localStorage
    valid = ["Food", "Clothing", "Stationery", "Toys"]
    if category not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose from: {valid}")
    return await compute_category_risk(category)


@router.get("/signals")
async def get_live_signals(source: Optional[str] = None, user: Optional[User] = Depends(get_current_user)):
    result = {}
    result["mandi"] = await fetch_mandi_prices()
    result["enam"] = await fetch_enam_prices()
    result["weather"] = await fetch_weather_data()
    # For demo: always include trade and logistics data
    result["trade"] = await fetch_trade_data()
    result["logistics"] = await fetch_logistics_data()
    if source and source in result:
        return {source: result[source]}
    return result


@router.get("/map-data")
async def get_map_data(user: Optional[User] = Depends(get_current_user)):
    weather = await fetch_weather_data()
    logistics = await fetch_logistics_data()
    mandi = await fetch_mandi_prices()
    points = []
    for w in weather:
        risk_score = w.get("disruption_severity", 0) * 100
        points.append({"lat": w["lat"], "lng": w["lng"], "region": w["city"], "risk_score": round(risk_score, 1), "risk_level": _score_to_level(risk_score), "segment": "procurement", "details": {"weather": w["weather_main"], "temp": f"{w['temperature']}°C", "wind": f"{w['wind_speed']} m/s"}})
    state_coords = {"Maharashtra": (19.75, 75.71), "Uttar Pradesh": (26.85, 80.95), "Madhya Pradesh": (22.97, 78.66), "Rajasthan": (27.02, 74.22), "Gujarat": (22.26, 71.19), "Karnataka": (15.32, 75.71), "Tamil Nadu": (11.13, 78.66), "Andhra Pradesh": (15.91, 79.74), "Punjab": (31.15, 75.34), "West Bengal": (22.99, 87.86)}
    for m in mandi:
        state = m.get("state", "")
        if state in state_coords:
            modal = m.get("modal_price", 0)
            max_p = m.get("max_price", 0)
            volatility = ((max_p - modal) / max_p * 100) if max_p > 0 else 0
            lat, lng = state_coords[state]
            lat += random.uniform(-0.5, 0.5)
            lng += random.uniform(-0.5, 0.5)
            points.append({"lat": lat, "lng": lng, "region": f"{m.get('market', state)}", "risk_score": round(min(volatility * 2, 100), 1), "risk_level": _score_to_level(min(volatility * 2, 100)), "segment": "procurement", "details": {"commodity": m.get("commodity"), "modal_price": f"₹{modal}", "market": m.get("market")}})
    corridors = []
    # For demo: always show corridors
    city_coords = {"Delhi": (28.704, 77.102), "Mumbai": (19.076, 72.877), "Chennai": (13.083, 80.271), "Kolkata": (22.573, 88.364), "Bangalore": (12.972, 77.595), "Ahmedabad": (23.023, 72.571), "Mangalore": (12.874, 74.843), "International": (10.0, 60.0)}
    for l in logistics:
        origin = l.get("origin", "")
        dest = l.get("destination", "")
        if origin in city_coords and dest in city_coords:
            risk = l.get("congestion_level", 0) * 100
            corridors.append({"origin": {"name": origin, "lat": city_coords[origin][0], "lng": city_coords[origin][1]}, "destination": {"name": dest, "lat": city_coords[dest][0], "lng": city_coords[dest][1]}, "mode": l.get("mode", "road"), "delay": l.get("current_delay_hours", 0), "risk_level": _score_to_level(risk), "risk_score": round(risk, 1)})
    return {"center": {"lat": 22.0, "lng": 78.0}, "zoom": 5, "points": points, "corridors": corridors}


@router.get("/risk-trend")
async def get_risk_trend(days: int = 7):
    import random
    random.seed(42)
    trend = []
    base = {"overall": 42, "procurement": 38, "transport": 45, "import_export": 40}
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days - i - 1)).strftime("%b %d")
        entry = {"date": date}
        for key in base:
            base[key] += random.uniform(-5, 5)
            base[key] = max(10, min(90, base[key]))
            entry[key] = round(base[key], 1)
        trend.append(entry)
    return {"trend": trend}


def _score_to_level(score):
    if score >= 75: return "critical"
    elif score >= 50: return "high"
    elif score >= 25: return "medium"
    return "low"
