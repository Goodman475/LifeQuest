from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import hash_password, verify_password


def create_user(db: Session, username: str, email: str, password: str):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return None

    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    normalized_email = (email or "").strip().lower()
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if not user:
        return None

    stored_hash = (user.hashed_password or "").strip()
    if not verify_password(password, stored_hash):
        return None

    return user