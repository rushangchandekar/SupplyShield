import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Supply Chain Risk Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./supply_chain_risk.db"
    )

    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # External APIs
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    WEATHER_API_URL: str = "https://api.openweathermap.org/data/2.5"
    GOV_DATA_API_KEY: str = os.getenv("GOV_DATA_API_KEY", "")
    GOV_DATA_API_URL: str = "https://api.data.gov.in/resource"
    ENAM_API_URL: str = "https://enam.gov.in/web/dashboard/trade-data"
    TRADE_API_URL: str = "https://api.data.gov.in/resource"
    LOGISTICS_API_URL: str = os.getenv("LOGISTICS_API_URL", "")

    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
