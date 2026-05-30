from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SegmentEnum(str, Enum):
    PROCUREMENT = "procurement"
    TRANSPORT = "transport"
    IMPORT_EXPORT = "import_export"


class RiskLevelEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskScoreResponse(BaseModel):
    id: str
    segment: str
    category: Optional[str] = None
    region: Optional[str] = None
    score: float
    risk_level: str
    contributing_factors: Optional[Dict[str, Any]] = None
    feature_weights: Optional[Dict[str, float]] = None
    computed_at: datetime

    class Config:
        from_attributes = True


class SignalResponse(BaseModel):
    id: str
    source: str
    region: Optional[str] = None
    commodity: Optional[str] = None
    value: Optional[float] = None
    severity: float
    timestamp: datetime

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    id: str
    segment: str
    category: Optional[str] = None
    region: Optional[str] = None
    action_type: str
    title: str
    description: str
    priority: int
    estimated_impact: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    overall_risk_score: float
    overall_risk_level: str
    segment_scores: Dict[str, float]
    active_signals_count: int
    critical_alerts: int
    recent_recommendations: List[RecommendationResponse]
    risk_trend: List[Dict[str, Any]]


class CategoryInsight(BaseModel):
    category: str
    risk_score: float
    risk_level: str
    top_risks: List[Dict[str, Any]]
    recommendations: List[RecommendationResponse]
    supply_network: Dict[str, Any]


class MapDataPoint(BaseModel):
    lat: float
    lng: float
    region: str
    risk_score: float
    risk_level: str
    segment: str
    details: Optional[Dict[str, Any]] = None
