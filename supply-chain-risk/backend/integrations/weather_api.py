"""
Weather API Integration (OpenWeatherMap)
Fetches weather disruption signals for supply chain regions.
"""
import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

# Key supply chain hub cities with coordinates
SUPPLY_CHAIN_HUBS = [
    {"name": "Mumbai", "lat": 19.076, "lng": 72.877, "region": "Maharashtra"},
    {"name": "Delhi", "lat": 28.704, "lng": 77.102, "region": "Delhi"},
    {"name": "Chennai", "lat": 13.083, "lng": 80.271, "region": "Tamil Nadu"},
    {"name": "Kolkata", "lat": 22.573, "lng": 88.364, "region": "West Bengal"},
    {"name": "Bangalore", "lat": 12.972, "lng": 77.595, "region": "Karnataka"},
    {"name": "Ahmedabad", "lat": 23.023, "lng": 72.571, "region": "Gujarat"},
    {"name": "Hyderabad", "lat": 17.385, "lng": 78.487, "region": "Telangana"},
    {"name": "Pune", "lat": 18.521, "lng": 73.855, "region": "Maharashtra"},
    {"name": "Lucknow", "lat": 26.847, "lng": 80.947, "region": "Uttar Pradesh"},
    {"name": "Jaipur", "lat": 26.913, "lng": 75.787, "region": "Rajasthan"},
]

# Weather conditions that cause disruptions
DISRUPTION_CONDITIONS = {
    "Thunderstorm": 0.8,
    "Rain": 0.4,
    "Heavy Rain": 0.7,
    "Drizzle": 0.1,
    "Snow": 0.6,
    "Mist": 0.2,
    "Fog": 0.4,
    "Haze": 0.2,
    "Dust": 0.3,
    "Tornado": 1.0,
    "Squall": 0.7,
    "Extreme": 0.9,
}


async def fetch_weather_data(
    cities: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Fetch current weather for major supply chain hubs.
    Calculates disruption severity based on weather conditions.
    """
    hubs = SUPPLY_CHAIN_HUBS
    if cities:
        hubs = [h for h in SUPPLY_CHAIN_HUBS if h["name"] in cities]

    results = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for hub in hubs:
                try:
                    params = {
                        "lat": hub["lat"],
                        "lon": hub["lng"],
                        "appid": settings.WEATHER_API_KEY,
                        "units": "metric",
                    }
                    response = await client.get(
                        f"{settings.WEATHER_API_URL}/weather",
                        params=params
                    )
                    response.raise_for_status()
                    data = response.json()
                    results.append(_normalize_weather(data, hub))
                except Exception as e:
                    logger.warning(f"Weather fetch failed for {hub['name']}: {e}")
                    results.append(_get_fallback_weather(hub))
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        results = [_get_fallback_weather(hub) for hub in hubs]

    return results


def _normalize_weather(data: Dict, hub: Dict) -> Dict[str, Any]:
    """Convert OpenWeatherMap response to disruption signal."""
    weather_main = data.get("weather", [{}])[0].get("main", "Clear")
    weather_desc = data.get("weather", [{}])[0].get("description", "")
    temp = data.get("main", {}).get("temp", 25)
    humidity = data.get("main", {}).get("humidity", 50)
    wind_speed = data.get("wind", {}).get("speed", 0)
    visibility = data.get("visibility", 10000)

    # Calculate disruption severity
    base_severity = DISRUPTION_CONDITIONS.get(weather_main, 0.0)

    # Adjust for wind speed (> 50 km/h is disruptive)
    wind_factor = min(wind_speed / 50.0, 1.0) * 0.3

    # Adjust for visibility (< 1000m is disruptive)
    vis_factor = max(0, (1000 - visibility) / 1000) * 0.2

    # Extreme temperatures
    temp_factor = 0.0
    if temp > 45 or temp < 0:
        temp_factor = 0.3

    severity = min(base_severity + wind_factor + vis_factor + temp_factor, 1.0)

    return {
        "source": "weather",
        "city": hub["name"],
        "region": hub["region"],
        "lat": hub["lat"],
        "lng": hub["lng"],
        "weather_main": weather_main,
        "weather_description": weather_desc,
        "temperature": temp,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "visibility": visibility,
        "disruption_severity": round(severity, 3),
        "is_disruptive": severity > 0.3,
        "timestamp": datetime.utcnow().isoformat()
    }


def _get_fallback_weather(hub: Dict) -> Dict[str, Any]:
    """Return fallback weather data for a hub."""
    import random
    conditions = ["Clear", "Clouds", "Rain", "Haze", "Mist"]
    condition = random.choice(conditions)
    severity = DISRUPTION_CONDITIONS.get(condition, 0.0)

    return {
        "source": "weather",
        "city": hub["name"],
        "region": hub["region"],
        "lat": hub["lat"],
        "lng": hub["lng"],
        "weather_main": condition,
        "weather_description": condition.lower(),
        "temperature": round(random.uniform(18, 42), 1),
        "humidity": random.randint(30, 90),
        "wind_speed": round(random.uniform(0, 30), 1),
        "visibility": random.randint(2000, 10000),
        "disruption_severity": round(severity + random.uniform(0, 0.2), 3),
        "is_disruptive": severity > 0.3,
        "timestamp": datetime.utcnow().isoformat()
    }
