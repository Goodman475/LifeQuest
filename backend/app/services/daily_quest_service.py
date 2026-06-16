from sqlalchemy.orm import Session
from app.models.daily_quest import DailyQuest
from app.models.quest import Quest
from app.models.user import User
from app.models.user_custom_quest import UserCustomQuest
from app.services.quest_generation import seed_default_quests
from app.services.xp_service import calculate_level, xp_into_current_level, xp_max_for_current_level, update_streak
from datetime import date
import random

DAILY_QUEST_COUNT = 5

QUEST_CATEGORIES = [
    "health",
    "endurance",
    "strength",
    "knowledge",
    "mindfulness",
]


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def get_user(db: Session, user_id: int):
    return db.query(User).filter_by(id=user_id).first()


def add_xp(user: User, amount: int):
    if user.xp is None:
        user.xp = 0
    user.xp += amount
    if user.xp < 0:
        user.xp = 0
    user.level = calculate_level(user.xp)


def remove_xp(user: User, amount: int):
    if user.xp is None:
        user.xp = 0
    user.xp = max(0, user.xp - amount)
    user.level = calculate_level(user.xp)


# ──────────────────────────────────────────────
# DAILY QUESTS
# ──────────────────────────────────────────────

def assign_daily_quests(db: Session, user_id: int):
    today = date.today()

    seed_default_quests(db)

    existing = db.query(DailyQuest).filter(
        DailyQuest.user_id == user_id,
        DailyQuest.assigned_date == today
    ).first()

    if existing:
        return

    selected = []

    for category in QUEST_CATEGORIES:
        quests = db.query(Quest).filter(Quest.skill_type == category).all()
        if quests:
            selected.append(random.choice(quests))

    all_quests = db.query(Quest).all()
    remaining = [q for q in all_quests if q.id not in [s.id for s in selected]]
    remaining_slots = DAILY_QUEST_COUNT - len(selected)

    if remaining_slots > 0 and remaining:
        selected.extend(random.sample(remaining, min(remaining_slots, len(remaining))))

    for quest in selected:
        db.add(DailyQuest(
            user_id=user_id,
            quest_id=quest.id,
            assigned_date=today,
            completed=False,
        ))

    db.commit()


def get_daily_quests(db: Session, user_id: int):
    today = date.today()
    assign_daily_quests(db, user_id)

    rows = db.query(DailyQuest, Quest).join(
        Quest, DailyQuest.quest_id == Quest.id
    ).filter(
        DailyQuest.user_id == user_id,
        DailyQuest.assigned_date == today,
        DailyQuest.completed == False,  # only show incomplete
    ).all()

    return [
        {
            "id": dq.id,
            "quest_id": q.id,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "difficulty": q.difficulty,
            "skill_type": q.skill_type,
            "done": dq.completed,
            "type": "daily",
        }
        for dq, q in rows
    ]


def toggle_daily_quest(db: Session, daily_quest_id: int, user_id: int):
    dq = db.query(DailyQuest).filter_by(
        id=daily_quest_id,
        user_id=user_id
    ).first()

    if not dq:
        return None

    user = get_user(db, user_id)
    quest = db.query(Quest).filter_by(id=dq.quest_id).first()

    if not user or not quest:
        return None

    # one-way only — once completed it stays done
    if dq.completed:
        return {
            "new_xp": xp_into_current_level(user.xp),
            "new_level": user.level,
            "completed": True,
        }

    dq.completed = True
    add_xp(user, quest.xp_reward)
    update_streak(user)

    db.commit()
    db.refresh(user)

    return {
        "new_xp": xp_into_current_level(user.xp),
        "new_level": user.level,
        "completed": True,
    }


# ──────────────────────────────────────────────
# CUSTOM QUESTS
# ──────────────────────────────────────────────

def get_custom_quests(db: Session, user_id: int):
    # only return manually created quests, not explorer-chosen ones
    quests = db.query(UserCustomQuest).filter_by(
        user_id=user_id,
        source="custom",
        completed=False,
    ).all()

    return [
        {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "done": q.completed,
            "type": "custom",
        }
        for q in quests
    ]


def create_custom_quest(db: Session, user_id: int, title: str, description: str, xp_reward: int):
    quest = UserCustomQuest(
        user_id=user_id,
        title=title,
        description=description,
        xp_reward=xp_reward,
        completed=False,
        source="custom",  # ← marks as manually created
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)

    return {
        "id": quest.id,
        "title": quest.title,
        "description": quest.description,
        "xp_reward": quest.xp_reward,
        "done": quest.completed,
        "type": "custom",
    }


def update_custom_quest(db: Session, quest_id: int, user_id: int, title: str, description: str, xp_reward: int):
    quest = db.query(UserCustomQuest).filter_by(
        id=quest_id,
        user_id=user_id,
        source="custom",  # only allow editing manually created quests
    ).first()

    if not quest:
        return None

    quest.title = title
    quest.description = description
    quest.xp_reward = xp_reward
    db.commit()
    db.refresh(quest)

    return {
        "id": quest.id,
        "title": quest.title,
        "description": quest.description,
        "xp_reward": quest.xp_reward,
        "done": quest.completed,
        "type": "custom",
    }


def delete_custom_quest(db: Session, quest_id: int, user_id: int):
    quest = db.query(UserCustomQuest).filter_by(
        id=quest_id,
        user_id=user_id,
    ).first()

    if not quest:
        return False

    db.delete(quest)
    db.commit()
    return True


def toggle_custom_quest(db: Session, quest_id: int, user_id: int):
    quest = db.query(UserCustomQuest).filter_by(
        id=quest_id,
        user_id=user_id,
    ).first()

    if not quest:
        return None

    user = get_user(db, user_id)
    if not user:
        return None

    # one-way only — matches frontend remove-on-tap behavior
    if quest.completed:
        return {
            "new_xp": xp_into_current_level(user.xp),
            "new_level": user.level,
            "completed": True,
        }

    quest.completed = True
    add_xp(user, quest.xp_reward)
    update_streak(user)

    db.commit()
    db.refresh(user)

    return {
        "new_xp": xp_into_current_level(user.xp),
        "new_xp_max": xp_max_for_current_level(user.xp),
        "new_level": user.level,
        "completed": True,
    }