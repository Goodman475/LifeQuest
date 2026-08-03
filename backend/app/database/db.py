import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import settings


def build_engine():
    database_url = settings.DATABASE_URL or os.getenv("DATABASE_URL")
    if database_url:
        try:
            engine = create_engine(database_url, pool_pre_ping=True)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return engine
        except Exception:
            pass

    sqlite_path = os.getenv("SQLITE_PATH", "/tmp/lifequest.db")
    return create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})


engine = build_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)