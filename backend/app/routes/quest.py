from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.deps import get_db
from app.schemas.quest import QuestCreate, CustomQuestCreate, CustomQuestUpdate
from app.services.quest_service import create_quest, toggle_quest, get_random_quests, save_random_quest
from app.services.daily_quest_service import (
    get_daily_quests, toggle_daily_quest,
    get_custom_quests, create_custom_quest,
    update_custom_quest, delete_custom_quest, toggle_custom_quest,
)
from app.services.quest_generation import seed_default_quests

router = APIRouter(prefix="/quests", tags=["Quests"])

# ── Admin: seed quests ─────────────────────────────────────
@router.post("/")
def create_new_quest(quest_data: QuestCreate, db: Session = Depends(get_db)):
    return create_quest(db, quest_data)

@router.patch("/{quest_id}/toggle/{user_id}")
def toggle_user_quest(quest_id: int, user_id: int, db: Session = Depends(get_db)):
    result = toggle_quest(db, user_id, quest_id)
    if not result:
        raise HTTPException(status_code=404, detail="Quest not found")
    return result

# ── Daily quests ───────────────────────────────────────────
@router.get("/daily/{user_id}")
def get_user_daily_quests(user_id: int, db: Session = Depends(get_db)):
    return get_daily_quests(db, user_id)

@router.patch("/daily/{daily_quest_id}/toggle/{user_id}")
def toggle_user_daily_quest(daily_quest_id: int, user_id: int, db: Session = Depends(get_db)):
    result = toggle_daily_quest(db, daily_quest_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Daily quest not found")
    return result

# ── Custom quests ──────────────────────────────────────────
@router.get("/custom/{user_id}")
def get_user_custom_quests(user_id: int, db: Session = Depends(get_db)):
    return get_custom_quests(db, user_id)

@router.post("/custom/{user_id}")
def create_user_custom_quest(user_id: int, quest_data: CustomQuestCreate, db: Session = Depends(get_db)):
    return create_custom_quest(db, user_id, quest_data.title, quest_data.description, quest_data.xp_reward)

@router.put("/custom/{quest_id}/user/{user_id}")
def update_user_custom_quest(quest_id: int, user_id: int, quest_data: CustomQuestUpdate, db: Session = Depends(get_db)):
    result = update_custom_quest(db, quest_id, user_id, quest_data.title, quest_data.description, quest_data.xp_reward)
    if not result:
        raise HTTPException(status_code=404, detail="Quest not found")
    return result

@router.delete("/custom/{quest_id}/user/{user_id}")
def delete_user_custom_quest(quest_id: int, user_id: int, db: Session = Depends(get_db)):
    success = delete_custom_quest(db, quest_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Quest not found")
    return {"message": "Quest deleted"}

@router.patch("/custom/{quest_id}/toggle/{user_id}")
def toggle_user_custom_quest(quest_id: int, user_id: int, db: Session = Depends(get_db)):
    result = toggle_custom_quest(db, quest_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Quest not found")
    return result

@router.get("/random/{user_id}")
def get_user_random_quests(user_id: int, count: int = 20, db: Session = Depends(get_db)):
    return get_random_quests(db, user_id, count)

@router.post("/random/{quest_id}/save/{user_id}")
def save_user_random_quest(quest_id: int, user_id: int, db: Session = Depends(get_db)):
    result = save_random_quest(db, user_id, quest_id)
    if not result:
        raise HTTPException(status_code=404, detail="Quest not found")
    return result