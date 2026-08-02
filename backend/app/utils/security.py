import hashlib
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from app.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordManager:
    @staticmethod
    def _normalize(password: str) -> str:
        return password.strip()

    @staticmethod
    def hash_password(password: str) -> str:
        normalized = PasswordManager._normalize(password)
        return pwd_context.hash(normalized)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if not hashed_password:
            return False

        normalized = PasswordManager._normalize(plain_password)
        legacy_candidates = {
            hashlib.sha256(normalized.encode("utf-8")).hexdigest(),
            hashlib.sha256(normalized.lower().encode("utf-8")).hexdigest(),
        }

        if hashed_password in legacy_candidates:
            return True

        try:
            return pwd_context.verify(normalized, hashed_password)
        except Exception:
            return False

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

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