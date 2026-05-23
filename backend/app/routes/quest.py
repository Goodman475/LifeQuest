from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.deps import get_db
from app.schemas.quest import QuestCreate
from app.services.quest_service import create_quest, complete_quest

router = APIRouter(prefix="/quests", tags=["Quests"])

@router.post("/")
def create_new_quest(quest_data: QuestCreate, db: Session = Depends(get_db)):
    """
    Create a new quest
    """
    return create_quest(db, quest_data)

@router.post("/{quest_id}/complete/{user_id}")
def complete_user_quest(quest_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Complete a quest for a specific user
    """
    return complete_quest(db, user_id, quest_id)