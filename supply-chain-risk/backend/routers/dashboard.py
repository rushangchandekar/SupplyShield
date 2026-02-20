"""
Dashboard Router
Provides dashboard data for free and premium users.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from models.user import User
from services.auth_service import get_current_user, is_premium_user
from services.risk_service import compute_all_risk_scores, compute_category_risk
from integrations.mandi_api import fetch_mandi_prices
from integrations.enam_api import fetch_enam_prices
from integrations.trade_api import fetch_trade_data
from integrations.weather_api import fetch_weather_data
from integrations.logistics_api import fetch_logistics_data

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary(user: Optional[User] = Depends(get_current_user)):
    """
    Get overall risk dashboard summary.
    Free users: generalized macro supply risk dashboard.
    Paid users: additional category-level insights.
    """
    risk_data = await compute_all_risk_scores()

    response = {
        "overall_score": risk_data["overall_score"],
        "overall_risk_level": risk_data["overall_risk_level"],
        "segments": risk_data["segments"],
        "signals_summary": risk_data["signals_summary"],
        "recommendations": risk_data["recommendations"][:3],
        "bottlenecks": risk_data["bottlenecks"][:3],
        "is_premium": is_premium_user(user),
        "computed_at": risk_data["computed_at"],
    }

    # Premium users get full data
    if is_premium_user(user):
        response["recommendations"] = risk_data["recommendations"]
        response["bottlenecks"] = risk_data["bottlenecks"]
        response["categories_available"] = ["Food", "Clothing", "Stationery", "Toys"]

    return response


@router.get("/category/{category}")
async def get_category_insights(
    category: str,
    user: Optional[User] = Depends(get_current_user)
):
    """
    Get detailed category-level risk insights.
    Premium feature only.
    """
    valid_categories = ["Food", "Clothing", "Stationery", "Toys"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose from: {valid_categories}")

    if not is_premium_user(user):
        raise HTTPException(
            status_code=403,
            detail="Category-level insights require a premium subscription. Upgrade to access detailed analysis."
        )

    return await compute_category_risk(category)


@router.get("/signals")
async def get_live_signals(
    source: Optional[str] = Query(None, description="Signal source filter"),
    user: Optional[User] = Depends(get_current_user)
):
    """Get live signals from all data sources."""
    signals = {
        "mandi": await fetch_mandi_prices(),
        "enam": await fetch_enam_prices(),
        "weather": await fetch_weather_data(),
    }

    # Premium users get all sources
    if is_premium_user(user):
        signals["trade"] = await fetch_trade_data()
        signals["logistics"] = await fetch_logistics_data()

    if source and source in signals:
        return {source: signals[source]}

    return signals


@router.get("/map-data")
async def get_map_data(user: Optional[User] = Depends(get_current_user)):
    """
    Get geospatial data for supply chain network map visualization.
    """
    weather_data = await fetch_weather_data()
    logistics_data = await fetch_logistics_data()

    map_points = []

    # Weather-based risk points
    for w in weather_data:
        map_points.append({
            "lat": w["lat"],
            "lng": w["lng"],
            "region": w["city"],
            "risk_score": round(w["disruption_severity"] * 100, 1),
            "risk_level": "high" if w["disruption_severity"] > 0.5 else ("medium" if w["disruption_severity"] > 0.2 else "low"),
            "segment": "weather",
            "details": {
                "condition": w["weather_main"],
                "temp": w["temperature"],
                "wind": w["wind_speed"],
            }
        })

    # Logistics corridor risk points
    for l in logistics_data:
        origin_coords = _get_city_coords(l["origin"])
        if origin_coords:
            map_points.append({
                "lat": origin_coords[0],
                "lng": origin_coords[1],
                "region": l["corridor_name"],
                "risk_score": round(l["congestion_level"] * 100, 1),
                "risk_level": "high" if l["congestion_level"] > 0.5 else "medium" if l["congestion_level"] > 0.2 else "low",
                "segment": "logistics",
                "details": {
                    "mode": l["mode"],
                    "delay_hours": l["current_delay_hours"],
                    "status": l["status"],
                }
            })

    # Corridors for line drawing
    corridors = []
    if is_premium_user(user):
        for l in logistics_data:
            origin = _get_city_coords(l["origin"])
            dest = _get_city_coords(l["destination"])
            if origin and dest:
                corridors.append({
                    "origin": {"lat": origin[0], "lng": origin[1], "name": l["origin"]},
                    "destination": {"lat": dest[0], "lng": dest[1], "name": l["destination"]},
                    "mode": l["mode"],
                    "risk_level": "high" if l["congestion_level"] > 0.5 else "medium" if l["congestion_level"] > 0.2 else "low",
                    "delay": l["current_delay_hours"],
                })

    return {
        "points": map_points,
        "corridors": corridors,
        "center": {"lat": 22.5937, "lng": 78.9629},
        "zoom": 5,
    }


def _get_city_coords(city):
    coords = {
        "Mumbai": (19.076, 72.877),
        "Delhi": (28.704, 77.102),
        "Chennai": (13.083, 80.271),
        "Kolkata": (22.573, 88.364),
        "Bangalore": (12.972, 77.595),
        "Ahmedabad": (23.023, 72.571),
        "Hyderabad": (17.385, 78.487),
        "Pune": (18.521, 73.855),
        "Lucknow": (26.847, 80.947),
        "Jaipur": (26.913, 75.787),
        "Mangalore": (12.914, 74.856),
        "International": None,
    }
    return coords.get(city)


@router.get("/risk-trend")
async def get_risk_trend(
    days: int = Query(7, ge=1, le=30),
    user: Optional[User] = Depends(get_current_user)
):
    """Get risk score trend over time (simulated from current data patterns)."""
    import random
    from datetime import datetime, timedelta

    risk_data = await compute_all_risk_scores()
    base_score = risk_data["overall_score"]

    trend = []
    now = datetime.utcnow()
    for i in range(days):
        date = now - timedelta(days=days - 1 - i)
        # Simulate trend with slight variation
        variation = random.uniform(-10, 10)
        score = max(0, min(100, base_score + variation))
        trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "overall": round(score, 1),
            "procurement": round(max(0, min(100, risk_data["segments"]["procurement"]["score"] + random.uniform(-8, 8))), 1),
            "transport": round(max(0, min(100, risk_data["segments"]["transport"]["score"] + random.uniform(-8, 8))), 1),
            "import_export": round(max(0, min(100, risk_data["segments"]["import_export"]["score"] + random.uniform(-8, 8))), 1),
        })

    return {"trend": trend, "days": days}
