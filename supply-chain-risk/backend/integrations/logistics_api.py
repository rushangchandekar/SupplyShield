"""
Logistics Data Feed Integration
"""
import httpx
import logging
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

LOGISTICS_CORRIDORS = [
    {"id": "DFC-WC", "name": "Delhi-Mumbai Western Corridor", "origin": "Delhi", "destination": "Mumbai", "mode": "rail", "distance_km": 1450},
    {"id": "DFC-EC", "name": "Delhi-Kolkata Eastern Corridor", "origin": "Delhi", "destination": "Kolkata", "mode": "rail", "distance_km": 1530},
    {"id": "NH48", "name": "Delhi-Jaipur-Ahmedabad Highway", "origin": "Delhi", "destination": "Ahmedabad", "mode": "road", "distance_km": 950},
    {"id": "NH44", "name": "Delhi-Bangalore National Highway", "origin": "Delhi", "destination": "Bangalore", "mode": "road", "distance_km": 2150},
    {"id": "JNPT-SEA", "name": "JNPT Mumbai Sea Route", "origin": "Mumbai", "destination": "International", "mode": "sea", "distance_km": 0},
    {"id": "CHENNAI-SEA", "name": "Chennai Port Sea Route", "origin": "Chennai", "destination": "International", "mode": "sea", "distance_km": 0},
    {"id": "NH16", "name": "Chennai-Kolkata East Coast", "origin": "Chennai", "destination": "Kolkata", "mode": "road", "distance_km": 1680},
    {"id": "AIR-DEL", "name": "Delhi IGI Air Cargo", "origin": "Delhi", "destination": "International", "mode": "air", "distance_km": 0},
    {"id": "AIR-BOM", "name": "Mumbai CSIA Air Cargo", "origin": "Mumbai", "destination": "International", "mode": "air", "distance_km": 0},
    {"id": "NH75", "name": "Bangalore-Mangalore Corridor", "origin": "Bangalore", "destination": "Mangalore", "mode": "road", "distance_km": 350},
]


async def fetch_logistics_data(corridor_id=None, mode=None):
    if settings.LOGISTICS_API_URL:
        try:
            return await _fetch_from_api(corridor_id, mode)
        except Exception as e:
            logger.warning(f"Logistics API unavailable: {e}")
    return _generate_logistics_indicators(corridor_id, mode)


async def _fetch_from_api(corridor_id, mode):
    async with httpx.AsyncClient(timeout=30.0) as client:
        params = {}
        if corridor_id:
            params["corridor_id"] = corridor_id
        if mode:
            params["mode"] = mode
        response = await client.get(settings.LOGISTICS_API_URL, params=params)
        response.raise_for_status()
        return response.json().get("corridors", [])


def _generate_logistics_indicators(corridor_id=None, mode=None):
    corridors = LOGISTICS_CORRIDORS
    if corridor_id:
        corridors = [c for c in corridors if c["id"] == corridor_id]
    if mode:
        corridors = [c for c in corridors if c["mode"] == mode]
    now = datetime.utcnow()
    results = []
    for corridor in corridors:
        base_delay = random.uniform(0, 2)
        hour = (now.hour + 5) % 24
        if 8 <= hour <= 11 or 17 <= hour <= 20:
            base_delay *= 1.5
        mode_factors = {"road": 1.3, "rail": 0.8, "sea": 0.6, "air": 0.4}
        delay_hours = base_delay * mode_factors.get(corridor["mode"], 1.0)
        congestion = min(delay_hours / 4.0, 1.0)
        disruption_prob = random.uniform(0.05, 0.35)
        if congestion > 0.6:
            disruption_prob += 0.2
        results.append({
            "source": "logistics", "corridor_id": corridor["id"],
            "corridor_name": corridor["name"], "origin": corridor["origin"],
            "destination": corridor["destination"], "mode": corridor["mode"],
            "distance_km": corridor["distance_km"],
            "current_delay_hours": round(delay_hours, 2),
            "avg_delay_hours": round(delay_hours * 0.8, 2),
            "congestion_level": round(congestion, 3),
            "disruption_probability": round(disruption_prob, 3),
            "capacity_utilization": round(random.uniform(0.55, 0.95), 3),
            "active_shipments": random.randint(50, 500),
            "status": "congested" if congestion > 0.5 else "normal",
            "last_incident": (now - timedelta(hours=random.randint(1, 72))).isoformat(),
            "timestamp": now.isoformat()
        })
    return results
