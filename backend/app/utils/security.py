import hashlib
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings


class PasswordManager:
    @staticmethod
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return PasswordManager.hash_password(plain_password) == hashed_password

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