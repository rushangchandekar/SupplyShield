"""
Authentication Router
Handles user registration, login, profile and subscription management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from services.auth_service import (
    create_user, authenticate_user, create_access_token,
    get_required_user, get_current_user, is_premium_user
)
from models.user import User, SubscriptionTier

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (free tier by default)."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user = create_user(
        db, user_data.email, user_data.password,
        user_data.full_name, user_data.company
    )
    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            company=user.company,
            subscription_tier=user.subscription_tier.value,
            created_at=user.created_at,
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT token."""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            company=user.company,
            subscription_tier=user.subscription_tier.value,
            created_at=user.created_at,
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(user: User = Depends(get_required_user)):
    """Get current user profile."""
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        company=user.company,
        subscription_tier=user.subscription_tier.value,
        created_at=user.created_at,
    )


@router.post("/upgrade")
async def upgrade_subscription(
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db)
):
    """Upgrade user to paid tier."""
    user.subscription_tier = SubscriptionTier.PAID
    db.commit()
    return {"message": "Subscription upgraded to paid tier", "tier": "paid"}


@router.post("/downgrade")
async def downgrade_subscription(
    user: User = Depends(get_required_user),
    db: Session = Depends(get_db)
):
    """Downgrade user to free tier."""
    user.subscription_tier = SubscriptionTier.FREE
    db.commit()
    return {"message": "Subscription downgraded to free tier", "tier": "free"}
