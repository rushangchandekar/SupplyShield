"""
Weather API Integration — OpenWeatherMap

Uses the FREE tier of OpenWeatherMap API (60 calls/min, 1M calls/month).
Sign up at: https://openweathermap.org/api

Maps weather conditions to supply chain disruption severity scores.
"""
import httpx
import logging
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

# Major Indian supply chain hubs with real coordinates
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

# Supply chain disruption severity weights by weather condition
DISRUPTION_SEVERITY = {
    "Thunderstorm": 0.85,
    "Drizzle": 0.10,
    "Rain": 0.40,
    "Snow": 0.65,
    "Mist": 0.15,
    "Smoke": 0.25,
    "Haze": 0.20,
    "Dust": 0.35,
    "Fog": 0.45,
    "Sand": 0.40,
    "Ash": 0.50,
    "Squall": 0.70,
    "Tornado": 1.00,
    "Clear": 0.00,
    "Clouds": 0.05,
}


async def fetch_weather_data(cities: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Fetch REAL weather data from OpenWeatherMap for supply chain hubs.
    Requires WEATHER_API_KEY — falls back to simulation only when key is missing.
    """
    hubs = SUPPLY_CHAIN_HUBS
    if cities:
        hubs = [h for h in SUPPLY_CHAIN_HUBS if h["name"] in cities]

    api_key = settings.WEATHER_API_KEY

    # If no API key, use intelligent simulation
    if not api_key:
        logger.warning("WEATHER_API_KEY not set — using simulated weather data. Sign up free at https://openweathermap.org/api")
        return [_generate_simulated_weather(hub) for hub in hubs]

    results = []
    async with httpx.AsyncClient(timeout=15.0) as client:
        for hub in hubs:
            try:
                params = {
                    "lat": hub["lat"],
                    "lon": hub["lng"],
                    "appid": api_key,
                    "units": "metric",
                }
                response = await client.get(
                    f"{settings.WEATHER_API_URL}/weather",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                results.append(_normalize_weather(data, hub))
                logger.debug(f"Weather fetched for {hub['name']}: {data.get('weather', [{}])[0].get('main')}")

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    logger.error("OpenWeatherMap API key invalid! Check WEATHER_API_KEY in .env")
                    results.append(_generate_simulated_weather(hub))
                else:
                    logger.warning(f"Weather fetch failed for {hub['name']}: HTTP {e.response.status_code}")
                    results.append(_generate_simulated_weather(hub))
            except Exception as e:
                logger.warning(f"Weather fetch error for {hub['name']}: {e}")
                results.append(_generate_simulated_weather(hub))

    logger.info(f"Weather data: {len(results)} hubs ({sum(1 for r in results if r.get('data_type') == 'live')} live, {sum(1 for r in results if r.get('data_type') == 'simulated')} simulated)")
    return results


def _normalize_weather(data: Dict, hub: Dict) -> Dict[str, Any]:
    """Convert raw OpenWeatherMap response to our disruption-aware format."""
    weather_list = data.get("weather", [{}])
    weather_main = weather_list[0].get("main", "Clear") if weather_list else "Clear"
    weather_desc = weather_list[0].get("description", "") if weather_list else ""

    main_data = data.get("main", {})
    temp = main_data.get("temp", 25)
    humidity = main_data.get("humidity", 50)
    feels_like = main_data.get("feels_like", temp)
    pressure = main_data.get("pressure", 1013)

    wind = data.get("wind", {})
    wind_speed = wind.get("speed", 0)
    wind_gust = wind.get("gust", 0)

    visibility = data.get("visibility", 10000)
    clouds = data.get("clouds", {}).get("all", 0)

    # Compute disruption severity as a composite score
    base_severity = DISRUPTION_SEVERITY.get(weather_main, 0.0)

    # Wind factor: high winds disrupt transport
    wind_factor = min(wind_speed / 50.0, 1.0) * 0.25

    # Visibility factor: low visibility disrupts logistics
    vis_factor = max(0, (3000 - visibility) / 3000) * 0.20

    # Temperature extreme factor: extreme heat/cold affects goods
    temp_factor = 0.0
    if temp > 45:
        temp_factor = 0.35
    elif temp > 42:
        temp_factor = 0.20
    elif temp < 2:
        temp_factor = 0.30
    elif temp < 5:
        temp_factor = 0.15

    # Humidity factor: high humidity affects perishables
    humidity_factor = max(0, (humidity - 85) / 15) * 0.10 if humidity > 85 else 0

    severity = min(base_severity + wind_factor + vis_factor + temp_factor + humidity_factor, 1.0)

    return {
        "source": "weather",
        "data_type": "live",
        "city": hub["name"],
        "region": hub["region"],
        "lat": hub["lat"],
        "lng": hub["lng"],
        "weather_main": weather_main,
        "weather_description": weather_desc,
        "temperature": round(temp, 1),
        "feels_like": round(feels_like, 1),
        "humidity": humidity,
        "pressure": pressure,
        "wind_speed": round(wind_speed, 1),
        "wind_gust": round(wind_gust, 1),
        "visibility": visibility,
        "cloud_cover": clouds,
        "disruption_severity": round(severity, 3),
        "is_disruptive": severity > 0.3,
        "disruption_factors": _explain_disruption(weather_main, wind_speed, visibility, temp, humidity),
        "timestamp": datetime.utcnow().isoformat(),
    }


def _explain_disruption(weather: str, wind: float, vis: int, temp: float, humidity: int) -> List[str]:
    """Generate human-readable disruption explanations."""
    factors = []
    if DISRUPTION_SEVERITY.get(weather, 0) > 0.3:
        factors.append(f"Severe weather: {weather}")
    if wind > 20:
        factors.append(f"High winds: {wind:.1f} m/s")
    if vis < 2000:
        factors.append(f"Low visibility: {vis}m")
    if temp > 42:
        factors.append(f"Extreme heat: {temp:.1f}°C")
    elif temp < 5:
        factors.append(f"Extreme cold: {temp:.1f}°C")
    if humidity > 90:
        factors.append(f"Very high humidity: {humidity}%")
    return factors


def _generate_simulated_weather(hub: Dict) -> Dict[str, Any]:
    """
    Generate realistic simulated weather when API key is unavailable.
    Uses time-of-day and regional patterns for realism.
    """
    now = datetime.utcnow()
    hour_ist = (now.hour + 5) % 24  # IST offset

    # Regional weather patterns
    regional_patterns = {
        "Maharashtra": {"temp_range": (22, 38), "conditions": ["Clear", "Clouds", "Haze", "Rain"]},
        "Delhi": {"temp_range": (10, 42), "conditions": ["Clear", "Haze", "Fog", "Dust"]},
        "Tamil Nadu": {"temp_range": (24, 36), "conditions": ["Clear", "Clouds", "Rain", "Thunderstorm"]},
        "West Bengal": {"temp_range": (18, 35), "conditions": ["Clear", "Clouds", "Rain", "Mist"]},
        "Karnataka": {"temp_range": (20, 34), "conditions": ["Clear", "Clouds", "Rain"]},
        "Gujarat": {"temp_range": (18, 40), "conditions": ["Clear", "Haze", "Dust", "Clouds"]},
        "Telangana": {"temp_range": (22, 38), "conditions": ["Clear", "Clouds", "Rain", "Haze"]},
        "Uttar Pradesh": {"temp_range": (8, 42), "conditions": ["Clear", "Fog", "Haze", "Rain"]},
        "Rajasthan": {"temp_range": (10, 45), "conditions": ["Clear", "Dust", "Haze", "Clouds"]},
    }

    pattern = regional_patterns.get(hub["region"], {"temp_range": (20, 35), "conditions": ["Clear", "Clouds"]})
    condition = random.choice(pattern["conditions"])
    temp_min, temp_max = pattern["temp_range"]

    # Temperature varies by time of day
    if 6 <= hour_ist <= 17:
        temp = random.uniform(temp_min + 5, temp_max)
    else:
        temp = random.uniform(temp_min, temp_max - 5)

    severity = DISRUPTION_SEVERITY.get(condition, 0.0) + random.uniform(0, 0.1)
    wind_speed = random.uniform(1, 25) if condition in ["Thunderstorm", "Squall"] else random.uniform(0, 12)

    return {
        "source": "weather",
        "data_type": "simulated",
        "city": hub["name"],
        "region": hub["region"],
        "lat": hub["lat"],
        "lng": hub["lng"],
        "weather_main": condition,
        "weather_description": condition.lower(),
        "temperature": round(temp, 1),
        "feels_like": round(temp + random.uniform(-2, 3), 1),
        "humidity": random.randint(30, 90),
        "pressure": random.randint(1005, 1020),
        "wind_speed": round(wind_speed, 1),
        "wind_gust": round(wind_speed * random.uniform(1.2, 2.0), 1),
        "visibility": random.randint(2000, 10000),
        "cloud_cover": random.randint(0, 100) if condition in ["Clouds", "Rain"] else random.randint(0, 30),
        "disruption_severity": round(min(severity, 1.0), 3),
        "is_disruptive": severity > 0.3,
        "disruption_factors": [],
        "timestamp": now.isoformat(),
    }
