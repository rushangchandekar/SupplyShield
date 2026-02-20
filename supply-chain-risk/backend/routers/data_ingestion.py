"""Data Ingestion Router — raw API data endpoints."""
from fastapi import APIRouter, Query
from typing import Optional
from integrations.mandi_api import fetch_mandi_prices
from integrations.enam_api import fetch_enam_prices
from integrations.trade_api import fetch_trade_data
from integrations.weather_api import fetch_weather_data
from integrations.logistics_api import fetch_logistics_data

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("/mandi")
async def get_mandi_data(commodity: Optional[str] = None, state: Optional[str] = None, limit: int = Query(50, le=200)):
    return await fetch_mandi_prices(commodity=commodity, state=state, limit=limit)

@router.get("/enam")
async def get_enam_data(commodity: Optional[str] = None, state: Optional[str] = None, limit: int = Query(50, le=200)):
    return await fetch_enam_prices(commodity=commodity, state=state, limit=limit)

@router.get("/trade")
async def get_trade_data_endpoint(commodity: Optional[str] = None, country: Optional[str] = None, limit: int = Query(50, le=200)):
    return await fetch_trade_data(commodity=commodity, country=country, limit=limit)

@router.get("/weather")
async def get_weather_data_endpoint():
    return await fetch_weather_data()

@router.get("/logistics")
async def get_logistics_data_endpoint(corridor_id: Optional[str] = None, mode: Optional[str] = None):
    return await fetch_logistics_data(corridor_id=corridor_id, mode=mode)
