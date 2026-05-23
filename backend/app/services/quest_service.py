from sqlalchemy.orm import Session

from app.models.quest import Quest
from app.models.user import User
from app.models.user_quest import UserQuest

from app.services.xp_service import calculate_level


def create_quest(db: Session, quest_data):
    quest = Quest(**quest_data.dict())
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


def complete_quest(db: Session, user_id: int, quest_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    quest = db.query(Quest).filter(Quest.id == quest_id).first()

    if not user or not quest:
        return None

    # Ensure xp is initialized
    if user.xp is None:
        user.xp = 0

    # Check if quest already completed
    existing = db.query(UserQuest).filter_by(user_id=user_id, quest_id=quest_id).first()
    if existing and existing.completed:
        return {
            "message": f"Quest '{quest.title}' already completed.",
            "new_xp": user.xp,
            "new_level": user.level
        }

    # Mark quest as completed
    completed_quest = UserQuest(
        user_id=user_id,
        quest_id=quest_id,
        completed=True
    )
    db.add(completed_quest)

    # Add XP and recalculate level
    user.xp += quest.xp_reward
    user.level = calculate_level(user.xp)

    db.commit()
    db.refresh(user)

    return {
        "message": f"Quest '{quest.title}' completed! You earned {quest.xp_reward} XP.",
        "new_xp": user.xp,
        "new_level": user.level
    }