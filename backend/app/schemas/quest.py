from pydantic import BaseModel

class QuestCreate(BaseModel):

    title: str

    description: str

    difficulty: str

    xp_reward: int

    skill_type: str


