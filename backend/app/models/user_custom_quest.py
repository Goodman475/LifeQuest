from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database.base import Base

class UserCustomQuest(Base):
    __tablename__ = "user_custom_quests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, default="")
    xp_reward = Column(Integer, default=50)
    completed = Column(Boolean, default=False)
    source = Column(String, default="custom")