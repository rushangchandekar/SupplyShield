import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON, Enum as SQLEnum
from database import Base
import enum


class SupplyChainSegment(str, enum.Enum):
    PROCUREMENT = "procurement"
    TRANSPORT = "transport"
    IMPORT_EXPORT = "import_export"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment = Column(SQLEnum(SupplyChainSegment), nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    region = Column(String(255), nullable=True, index=True)
    score = Column(Float, nullable=False)
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    contributing_factors = Column(JSON, nullable=True)
    feature_weights = Column(JSON, nullable=True)
    model_version = Column(String(50), nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
