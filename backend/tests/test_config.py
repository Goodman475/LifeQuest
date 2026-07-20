from app.config import Settings


def test_settings_reads_environment_overrides(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@host:5432/app")
    monkeypatch.setenv("CORS_ORIGINS", "https://app.example.com,https://admin.example.com")
    monkeypatch.setenv("SECRET_KEY", "super-secret")
    monkeypatch.setenv("DEBUG", "true")

    settings = Settings()

    assert settings.DATABASE_URL == "postgresql://user:pass@host:5432/app"
    assert settings.CORS_ORIGINS == ["https://app.example.com", "https://admin.example.com"]
    assert settings.SECRET_KEY == "super-secret"
    assert settings.DEBUG is True
