import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON, Enum as SQLEnum
from database import Base
import enum


class SignalSource(str, enum.Enum):
    MANDI = "mandi"
    ENAM = "enam"
    TRADE = "trade"
    WEATHER = "weather"
    LOGISTICS = "logistics"


class Signal(Base):
    __tablename__ = "signals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(SQLEnum(SignalSource), nullable=False, index=True)
    region = Column(String(255), nullable=True, index=True)
    commodity = Column(String(255), nullable=True, index=True)
    value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    raw_data = Column(JSON, nullable=True)
    severity = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
