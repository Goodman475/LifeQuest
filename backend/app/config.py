import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.DATABASE_URL = os.getenv("DATABASE_URL", "")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
        )

        cors_origins = os.getenv("CORS_ORIGINS", "*")
        if cors_origins == "*":
            self.CORS_ORIGINS = ["*"]
        else:
            self.CORS_ORIGINS = [
                item.strip() for item in cors_origins.split(",") if item.strip()
            ]

        debug_value = os.getenv("DEBUG", "false").strip().lower()
        self.DEBUG = debug_value in {"1", "true", "yes", "on"}

        if not self.DEBUG and self.SECRET_KEY == "change-me-in-production":
            raise ValueError("SECRET_KEY must be set to a secure value in non-debug deployments")


settings = Settings()
