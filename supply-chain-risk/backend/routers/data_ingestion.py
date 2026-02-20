"""
Data Ingestion Router
Provides raw data from external APIs for frontend display.
"""
from fastapi import APIRouter, Query
from typing import Optional
from integrations.mandi_api import fetch_mandi_prices
from integrations.enam_api import fetch_enam_prices
from integrations.trade_api import fetch_trade_data
from integrations.weather_api import fetch_weather_data
from integrations.logistics_api import fetch_logistics_data

router = APIRouter(prefix="/api/data", tags=["Data Ingestion"])


@router.get("/mandi")
async def get_mandi_data(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    """Fetch latest mandi/commodity price data from data.gov.in."""
    data = await fetch_mandi_prices(commodity=commodity, state=state, limit=limit)
    return {"source": "mandi", "count": len(data), "data": data}


@router.get("/enam")
async def get_enam_data(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    """Fetch latest eNAM market price data."""
    data = await fetch_enam_prices(commodity=commodity, state=state, limit=limit)
    return {"source": "enam", "count": len(data), "data": data}


@router.get("/trade")
async def get_trade_data_endpoint(
    commodity: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    """Fetch import/export trade statistics."""
    data = await fetch_trade_data(commodity=commodity, country=country, limit=limit)
    return {"source": "trade", "count": len(data), "data": data}


@router.get("/weather")
async def get_weather_data_endpoint():
    """Fetch weather disruption signals for supply chain hubs."""
    data = await fetch_weather_data()
    return {"source": "weather", "count": len(data), "data": data}


@router.get("/logistics")
async def get_logistics_data_endpoint(
    corridor_id: Optional[str] = Query(None),
    mode: Optional[str] = Query(None, description="road, rail, sea, air")
):
    """Fetch logistics transport delay indicators."""
    data = await fetch_logistics_data(corridor_id=corridor_id, mode=mode)
    return {"source": "logistics", "count": len(data), "data": data}
