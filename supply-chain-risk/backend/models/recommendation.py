import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Enum as SQLEnum
from database import Base
import enum


class ActionType(str, enum.Enum):
    INCREASE_INVENTORY = "increase_inventory"
    DIVERSIFY_SUPPLIERS = "diversify_suppliers"
    SWITCH_ROUTES = "switch_routes"
    HEDGE_PROCUREMENT = "hedge_procurement"
    EXPEDITE_SHIPPING = "expedite_shipping"
    ALTERNATIVE_SOURCING = "alternative_sourcing"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    region = Column(String(255), nullable=True)
    action_type = Column(SQLEnum(ActionType), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(String(2000), nullable=False)
    priority = Column(Integer, default=1)
    estimated_impact = Column(Float, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
