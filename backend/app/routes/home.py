from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.services.quest_service import get_home_data

router = APIRouter(prefix="/home", tags=["Home"])

@router.get("/{user_id}")
def get_home(user_id: int, db: Session = Depends(get_db)):
    data = get_home_data(db, user_id)
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    return data