from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.models.user import User

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/")
def get_leaderboard(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .order_by(User.level.desc(), User.total_completed.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": u.id,
            "username": u.username,
            "level": u.level or 1,
            "total_completed": u.total_completed or 0,
            "xp": u.xp or 0,
        }
        for u in users
    ]