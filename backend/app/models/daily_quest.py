from sqlalchemy import Column, Integer, ForeignKey, Date, Boolean
from datetime import date
from app.database.base import Base

class DailyQuest(Base):
    __tablename__ = "daily_quests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quest_id = Column(Integer, ForeignKey("quests.id"))
    assigned_date = Column(Date, default=date.today)
    completed = Column(Boolean, default=False)