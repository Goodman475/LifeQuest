from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class QuestCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    xp_reward: int
    skill_type: str

class CustomQuestCreate(BaseModel):
    title: str
    description: str = ""
    xp_reward: int = 50

class CustomQuestUpdate(BaseModel):
    title: str
    description: str = ""
    xp_reward: int

class QuestOut(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    xp_reward: int
    skill_type: str

    class Config:
        from_attributes = True

class UserQuestOut(BaseModel):
    id: int
    quest_id: int
    title: str
    xp_reward: int
    done: bool

class HomeStats(BaseModel):
    streak: int
    completed: int
    rank: int

class CharacterOut(BaseModel):
    class_name: str
    level: int
    xp_current: int
    xp_max: int

class FeedItem(BaseModel):
    id: int
    name: str
    action: str
    time: str

class HomeResponse(BaseModel):
    user_name: str
    character: CharacterOut
    stats: HomeStats
    quests: list[UserQuestOut]
    feed: list[FeedItem]