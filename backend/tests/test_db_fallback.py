from sqlalchemy import text

from app.database import db as db_module


def test_build_engine_falls_back_to_sqlite_when_database_url_is_unreachable(monkeypatch, tmp_path):
    monkeypatch.setattr(db_module.settings, "DATABASE_URL", "postgresql://user:pass@does-not-resolve.invalid:5432/db")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    sqlite_path = tmp_path / "fallback.db"
    monkeypatch.setenv("SQLITE_PATH", str(sqlite_path))

    engine = db_module.build_engine()

    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        assert result.scalar() == 1
