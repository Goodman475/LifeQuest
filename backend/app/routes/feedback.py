from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.models.feedback import Feedback
from pydantic import BaseModel

router = APIRouter(prefix="/feedback", tags=["Feedback"])


class FeedbackCreate(BaseModel):
    user_id: int
    rating: int
    message: str


@router.post("/")
def create_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db)
):
    feedback = Feedback(
        user_id=data.user_id,
        rating=data.rating,
        message=data.message
    )

    db.add(feedback)
    db.commit()

    return {"success": True}