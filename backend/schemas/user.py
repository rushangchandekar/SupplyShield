from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class SubscriptionTierEnum(str, Enum):
    FREE = "free"
    PAID = "paid"


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    company: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    subscription_tier: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
