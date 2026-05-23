from sqlalchemy import Column, Integer, String
from app.database.base import Base

class Quest(Base):

    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, index=True)

    description = Column(String)

    difficulty = Column(String)

    xp_reward = Column(Integer, default = 50)

    skill_type = Column(String)