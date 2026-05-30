"""Auth Router"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from models.user import User, SubscriptionTier
from services.auth_service import (
    create_user, authenticate_user, create_access_token,
    get_current_user, get_required_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, user_data.email, user_data.password, user_data.full_name, user_data.company)
    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), email=user.email, full_name=user.full_name, company=user.company, subscription_tier=user.subscription_tier.value, created_at=user.created_at)
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=str(user.id), email=user.email, full_name=user.full_name, company=user.company, subscription_tier=user.subscription_tier.value, created_at=user.created_at)
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(user: User = Depends(get_required_user)):
    return UserResponse(id=str(user.id), email=user.email, full_name=user.full_name, company=user.company, subscription_tier=user.subscription_tier.value, created_at=user.created_at)


@router.post("/upgrade")
async def upgrade_to_premium(user: User = Depends(get_required_user), db: Session = Depends(get_db)):
    user.subscription_tier = SubscriptionTier.PAID
    db.commit()
    return {"message": "Upgraded to premium", "subscription_tier": "paid"}
