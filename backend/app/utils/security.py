import hashlib
import os
from datetime import datetime, timedelta

from jose import jwt

from app.config import settings


class PasswordManager:
    @staticmethod
    def _normalize(password: str) -> str:
        return password.strip().lower()

    @staticmethod
    def hash_password(password: str) -> str:
        normalized = PasswordManager._normalize(password)
        return f"sha256${hashlib.sha256(normalized.encode('utf-8')).hexdigest()}"

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if not hashed_password:
            return False

        normalized = PasswordManager._normalize(plain_password)
        expected_hash = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
        legacy_candidates = {
            expected_hash,
            hashlib.sha256(plain_password.strip().encode("utf-8")).hexdigest(),
        }

        if hashed_password in legacy_candidates:
            return True

        if hashed_password.startswith("sha256$"):
            return hashed_password.split("$", 1)[1] == expected_hash

        return False

SECRET_KEY = (settings.SECRET_KEY or os.getenv("SECRET_KEY") or "dev-secret").strip()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(settings.ACCESS_TOKEN_EXPIRE_MINUTES or os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# -----------------------------
# PASSWORD HANDLING 
# -----------------------------

def hash_password(password: str) -> str:
    return PasswordManager.hash_password(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return PasswordManager.verify_password(plain_password, hashed_password)


# -----------------------------
# JWT TOKEN
# -----------------------------

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)