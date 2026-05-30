"""
Logistics Data Feed Integration

No free public API exists for Indian logistics corridor data.
This module generates REALISTIC logistics simulation based on:
- Real corridor distances and mode-specific delay patterns
- Time-of-day congestion patterns (peak vs off-peak IST)
- Day-of-week patterns (weekday vs weekend)
- Seasonal patterns (monsoon, festival season, etc.)
- Random disruption events with realistic probabilities

The data is clearly marked as "simulated" so the frontend knows.
When a LOGISTICS_API_URL is configured, real data is fetched instead.
"""
import httpx
import logging
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

# Real Indian logistics corridors with actual distances
LOGISTICS_CORRIDORS = [
    {"id": "DFC-WC", "name": "Delhi–Mumbai DFC (Western)", "origin": "Delhi", "destination": "Mumbai", "mode": "rail", "distance_km": 1504, "avg_transit_hours": 18, "origin_lat": 28.704, "origin_lng": 77.102, "dest_lat": 19.076, "dest_lng": 72.877},
    {"id": "DFC-EC", "name": "Delhi–Kolkata DFC (Eastern)", "origin": "Delhi", "destination": "Kolkata", "mode": "rail", "distance_km": 1530, "avg_transit_hours": 20, "origin_lat": 28.704, "origin_lng": 77.102, "dest_lat": 22.573, "dest_lng": 88.364},
    {"id": "NH48", "name": "Delhi–Ahmedabad (NH 48)", "origin": "Delhi", "destination": "Ahmedabad", "mode": "road", "distance_km": 950, "avg_transit_hours": 14, "origin_lat": 28.704, "origin_lng": 77.102, "dest_lat": 23.023, "dest_lng": 72.571},
    {"id": "NH44-S", "name": "Delhi–Bangalore (NH 44)", "origin": "Delhi", "destination": "Bangalore", "mode": "road", "distance_km": 2150, "avg_transit_hours": 36, "origin_lat": 28.704, "origin_lng": 77.102, "dest_lat": 12.972, "dest_lng": 77.595},
    {"id": "NH44-N", "name": "Delhi–Chennai (NH 44)", "origin": "Delhi", "destination": "Chennai", "mode": "road", "distance_km": 2175, "avg_transit_hours": 38, "origin_lat": 28.704, "origin_lng": 77.102, "dest_lat": 13.083, "dest_lng": 80.271},
    {"id": "JNPT-INT", "name": "JNPT Mumbai International", "origin": "Mumbai", "destination": "International", "mode": "sea", "distance_km": 0, "avg_transit_hours": 0, "origin_lat": 19.076, "origin_lng": 72.877, "dest_lat": 10.0, "dest_lng": 60.0},
    {"id": "CHENNAI-INT", "name": "Chennai Port International", "origin": "Chennai", "destination": "International", "mode": "sea", "distance_km": 0, "avg_transit_hours": 0, "origin_lat": 13.083, "origin_lng": 80.271, "dest_lat": 10.0, "dest_lng": 60.0},
    {"id": "NH16", "name": "Chennai–Kolkata (NH 16)", "origin": "Chennai", "destination": "Kolkata", "mode": "road", "distance_km": 1680, "avg_transit_hours": 28, "origin_lat": 13.083, "origin_lng": 80.271, "dest_lat": 22.573, "dest_lng": 88.364},
    {"id": "AIR-DEL", "name": "Delhi IGI Air Cargo", "origin": "Delhi", "destination": "International", "mode": "air", "distance_km": 0, "avg_transit_hours": 0, "origin_lat": 28.704, "origin_lng": 77.102, "dest_lat": 35.0, "dest_lng": 50.0},
    {"id": "NH75", "name": "Bangalore–Mangalore (NH 75)", "origin": "Bangalore", "destination": "Mangalore", "mode": "road", "distance_km": 350, "avg_transit_hours": 6, "origin_lat": 12.972, "origin_lng": 77.595, "dest_lat": 12.874, "dest_lng": 74.843},
]


async def fetch_logistics_data(
    corridor_id: Optional[str] = None,
    mode: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Fetch logistics corridor data.
    Uses real API if LOGISTICS_API_URL is configured, otherwise generates
    realistic simulated data based on time-of-day and corridor patterns.
    """
    if settings.LOGISTICS_API_URL:
        try:
            return await _fetch_from_api(corridor_id, mode)
        except Exception as e:
            logger.warning(f"Logistics API unreachable ({e}), falling back to simulation")

    return _generate_corridor_data(corridor_id, mode)


async def _fetch_from_api(corridor_id: Optional[str], mode: Optional[str]) -> List[Dict[str, Any]]:
    """Fetch from real logistics API when configured."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        params = {}
        if corridor_id:
            params["corridor_id"] = corridor_id
        if mode:
            params["mode"] = mode
        response = await client.get(settings.LOGISTICS_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        results = data.get("corridors", data if isinstance(data, list) else [])
        for r in results:
            r["source"] = "logistics"
            r["data_type"] = "live"
        return results


def _generate_corridor_data(corridor_id: Optional[str], mode: Optional[str]) -> List[Dict[str, Any]]:
    """
    Generate realistic logistics simulation based on real-world patterns.
    """
    corridors = LOGISTICS_CORRIDORS
    if corridor_id:
        corridors = [c for c in corridors if c["id"] == corridor_id]
    if mode:
        corridors = [c for c in corridors if c["mode"] == mode]

    now = datetime.utcnow()
    hour_ist = (now.hour + 5) % 24  # Convert to IST
    day_of_week = now.weekday()  # 0=Monday, 6=Sunday
    month = now.month

    results = []
    for corridor in corridors:
        # Base delay factor by mode (rail is more predictable, road varies more)
        mode_base = {"road": 1.5, "rail": 0.7, "sea": 0.5, "air": 0.3}
        base_delay = random.uniform(0.5, 2.5) * mode_base.get(corridor["mode"], 1.0)

        # Time-of-day pattern: peak hours have more congestion (IST)
        if 8 <= hour_ist <= 11 or 17 <= hour_ist <= 20:
            time_factor = 1.6  # Peak hours
        elif 22 <= hour_ist or hour_ist <= 5:
            time_factor = 0.6  # Night — less traffic
        else:
            time_factor = 1.0

        # Day-of-week: weekends lighter for road, ports busy on weekdays
        if day_of_week >= 5:  # Weekend
            if corridor["mode"] == "road":
                time_factor *= 0.7
            elif corridor["mode"] == "sea":
                time_factor *= 0.9

        # Seasonal: monsoon increases road delays significantly
        monsoon_factor = 1.0
        if 6 <= month <= 9:  # June–September monsoon
            if corridor["mode"] == "road":
                monsoon_factor = 1.8
            elif corridor["mode"] == "sea":
                monsoon_factor = 1.3
        elif month in [10, 11]:  # Festival season — higher cargo volume
            monsoon_factor = 1.3

        delay_hours = base_delay * time_factor * monsoon_factor

        # Congestion level (0.0 – 1.0)
        congestion = min(delay_hours / 5.0, 1.0)

        # Disruption probability based on conditions
        base_disruption = random.uniform(0.05, 0.20)
        if congestion > 0.6:
            base_disruption += 0.15
        if 6 <= month <= 9 and corridor["mode"] == "road":
            base_disruption += 0.10

        # Capacity utilization varies by time
        if 8 <= hour_ist <= 20:
            capacity = random.uniform(0.65, 0.95)
        else:
            capacity = random.uniform(0.30, 0.70)

        # Active shipments proportional to capacity
        active = int(capacity * random.randint(100, 600))

        # Status determination
        if congestion > 0.6:
            status = "congested"
        elif congestion > 0.3:
            status = "moderate"
        else:
            status = "normal"

        results.append({
            "source": "logistics",
            "data_type": "simulated",
            "corridor_id": corridor["id"],
            "corridor_name": corridor["name"],
            "origin": corridor["origin"],
            "destination": corridor["destination"],
            "mode": corridor["mode"],
            "distance_km": corridor["distance_km"],
            "avg_transit_hours": corridor["avg_transit_hours"],
            "current_delay_hours": round(delay_hours, 2),
            "avg_delay_hours": round(delay_hours * 0.75, 2),
            "congestion_level": round(congestion, 3),
            "disruption_probability": round(min(base_disruption, 1.0), 3),
            "capacity_utilization": round(capacity, 3),
            "active_shipments": active,
            "status": status,
            "monsoon_impact": 6 <= month <= 9,
            "peak_hour": 8 <= hour_ist <= 11 or 17 <= hour_ist <= 20,
            "last_incident": (now - timedelta(hours=random.randint(2, 96))).isoformat(),
            "timestamp": now.isoformat(),
        })

    logger.info(f"Logistics data: {len(results)} corridors (status: {', '.join(r['corridor_id'] + '=' + r['status'] for r in results[:5])})")
    return results
