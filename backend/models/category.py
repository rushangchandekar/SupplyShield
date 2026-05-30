import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    icon = Column(String(50), nullable=True)
    is_premium = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
