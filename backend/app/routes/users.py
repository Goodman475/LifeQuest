from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.deps import get_db
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

class AvatarUpdate(BaseModel):
    avatar: str
    color: str

@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar": user.avatar,
        "avatar_color": user.avatar_color,
        "level": user.level,
        "xp": user.xp,
        "streak": user.streak,
        "total_completed": user.total_completed,
    }

@router.patch("/{user_id}/avatar")
def update_avatar(user_id: int, data: AvatarUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.avatar = data.avatar
    user.avatar_color = data.color
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "avatar": user.avatar,
        "avatar_color": user.avatar_color,
    }
