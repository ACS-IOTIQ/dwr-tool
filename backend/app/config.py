
# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    REPORT_CUTOFF_HOUR: int = 18            # 6 PM cutoff
    REPORT_CUTOFF_MINUTE: int = 30
    APP_TIMEZONE: str = "Asia/Kolkata"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()