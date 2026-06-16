from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.services.auth_services import create_user, authenticate_user
from app.utils.security import create_access_token
from app.schemas.user import UserRegister, UserLogin
from app.models.user import User
from app.models.user_quest import UserQuest
from app.models.user_custom_quest import UserCustomQuest
from app.models.daily_quest import DailyQuest

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    new_user = create_user(db, user.username, user.email, user.password)
    if not new_user:
        raise HTTPException(status_code=400, detail="User already exists")
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    auth_user = authenticate_user(db, user.email, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": auth_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": auth_user.id,
        "username": auth_user.username,
    }

@router.delete("/delete/{user_id}")
def delete_account(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(UserQuest).filter_by(user_id=user_id).delete()
    db.query(UserCustomQuest).filter_by(user_id=user_id).delete()
    db.query(DailyQuest).filter_by(user_id=user_id).delete()
    db.delete(user)
    db.commit()

    return {"message": "Account deleted successfully"}