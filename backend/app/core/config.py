import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ServiceZone API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "servicezone-super-secure-production-secret-key-quantico-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Defaults to local SQLite for instant out-of-the-box local dev & test, or PostgreSQL when provided
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./servicezone.db")
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Business default settings
    BUSINESS_NAME: str = "ServiceZone Precision Repair"
    BUSINESS_PHONE: str = "+1 (555) 737-8491"
    BUSINESS_EMAIL: str = "intake@servicezone.tech"
    BUSINESS_ADDRESS: str = "104 Tech Boulevard, Suite B, Workshop Bay 4"
    TIMEZONE: str = "UTC"
    AUTO_CONFIRM_BOOKINGS: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
