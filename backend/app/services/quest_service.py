from sqlalchemy.orm import Session
from app.models.quest import Quest
from app.models.user import User
from app.models.user_quest import UserQuest
from app.models.user_custom_quest import UserCustomQuest
from app.services.xp_service import (
    calculate_level,
    xp_into_current_level,
    xp_max_for_current_level,
    xp_needed_for_next_level,
    update_streak,
)
from app.services.daily_quest_service import get_daily_quests, get_custom_quests
from app.models.daily_quest import DailyQuest
from datetime import datetime, UTC, date
import random


def create_quest(db: Session, quest_data):
    quest = Quest(**quest_data.dict())
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


def toggle_quest(db: Session, user_id: int, quest_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not user or not quest:
        return None

    if user.xp is None:
        user.xp = 0

    existing = db.query(UserQuest).filter_by(
        user_id=user_id, quest_id=quest_id
    ).first()

    if existing and existing.completed:
        # Already completed — no-op, just return current state
        return {
            "new_xp": xp_into_current_level(user.xp),
            "new_level": user.level,
            "completed": True,
        }

    # First completion
    if existing:
        existing.completed = True
        existing.completed_at = datetime.now(UTC)
    else:
        db.add(UserQuest(
            user_id=user_id,
            quest_id=quest_id,
            completed=True,
            completed_at=datetime.now(UTC),
        ))

    user.xp += quest.xp_reward
    user.level = calculate_level(user.xp)
    update_streak(user) 

    db.commit()
    db.refresh(user)

    return {
        "new_xp": xp_into_current_level(user.xp),
        "new_xp_max": xp_max_for_current_level(user.xp),
        "new_level": user.level,
        "completed": True,
    }


def get_home_data(db: Session, user_id: int):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        return None

    if user.xp is None:
        user.xp = 0

    daily_quests = get_daily_quests(db, user_id)

    custom_quests = [
        {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "done": q.completed,
            "type": "custom",
        }
        for q in db.query(UserCustomQuest)
        .filter_by(user_id=user_id, completed=False, source="custom")
        .all()
    ]

    chosen_quests = [
        {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "done": q.completed,
            "type": "selected",
        }
        for q in db.query(UserCustomQuest)
        .filter_by(user_id=user_id, completed=False, source="selected")
        .all()
    ]

    # count completions from all sources
    daily_completed = db.query(DailyQuest).filter_by(
        user_id=user_id, completed=True
    ).count()

    quest_completed = db.query(UserQuest).filter_by(
        user_id=user_id, completed=True
    ).count()

    custom_completed = db.query(UserCustomQuest).filter_by(
        user_id=user_id, completed=True
    ).count()

    total_completed = daily_completed + quest_completed + custom_completed

    return {
        "user_name": user.username,
        "character": {
            "level": user.level,
            "xp_current": xp_into_current_level(user.xp),
            "xp_max": xp_max_for_current_level(user.xp),
        },
        "stats": {
            "streak": user.streak or 0,               
            "completed": user.total_completed or 0,
            "rank": get_rank(db, user_id),  # real rank among all users
        },
        "quests": [
            *daily_quests,
            *custom_quests,
            *chosen_quests,
        ],
        "feed": [],
    }
    


def get_random_quests(db: Session, user_id: int, count: int = 20):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    completed_ids = [
        quest_id for (quest_id,) in db.query(UserQuest.quest_id)
        .filter_by(user_id=user_id, completed=True).all()
    ]
    today = date.today()
    daily_ids = [
        quest_id for (quest_id,) in db.query(DailyQuest.quest_id)
        .filter_by(user_id=user_id, assigned_date=today).all()
    ]
    custom_titles = [
        q.title for q in db.query(UserCustomQuest)
        .filter_by(user_id=user_id).all()
    ]
    excluded_ids = set(completed_ids) | set(daily_ids)

    query = db.query(Quest)
    if excluded_ids:
        query = query.filter(~Quest.id.in_(excluded_ids))
    if custom_titles:
        query = query.filter(~Quest.title.in_(custom_titles))

    available = query.all()
    if not available:
        available = db.query(Quest).all()

    selected = random.sample(available, min(count, len(available)))

    return [
        {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "difficulty": q.difficulty,
            "skill_type": q.skill_type,
            "type": "random",
        }
        for q in selected
    ]


def save_random_quest(db: Session, user_id: int, quest_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not user or not quest:
        return None

    existing = db.query(UserCustomQuest).filter_by(
        user_id=user_id, title=quest.title
    ).first()

    if existing:
        return {
            "id": existing.id,
            "title": existing.title,
            "description": existing.description,
            "xp_reward": existing.xp_reward,
            "done": existing.completed,
            "type": "selected",
        }

    custom = UserCustomQuest(
        user_id=user_id,
        title=quest.title,
        description=quest.description,
        xp_reward=quest.xp_reward,
        completed=False,
        source="selected",
    )
    db.add(custom)
    db.commit()
    db.refresh(custom)

    return {
        "id": custom.id,
        "title": custom.title,
        "description": custom.description,
        "xp_reward": custom.xp_reward,
        "done": custom.completed,
        "type": "selected",
    }


def get_streak(db: Session, user_id: int) -> int:
    completions = (
        db.query(UserQuest.completed_at)
        .filter_by(user_id=user_id, completed=True)
        .order_by(UserQuest.completed_at.desc())
        .all()
    )
    if not completions:
        return 0

    streak = 1
    today = datetime.now(UTC).date()
    prev = today

    for (completed_at,) in completions:
        if completed_at is None:
            continue
        day = completed_at.date() if hasattr(completed_at, "date") else completed_at
        if day == prev:
            continue
        if (prev - day).days == 1:
            streak += 1
            prev = day
        else:
            break

    return streak


def get_rank(db: Session, user_id: int) -> int:
    users = db.query(User).order_by(User.xp.desc()).all()
    for i, u in enumerate(users, start=1):
        if u.id == user_id:
            return i
    return 0