from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime, UTC

from app.database.base import Base

class UserQuest(Base):

    __tablename__ = "user_quests"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    quest_id = Column(Integer, ForeignKey("quests.id"))

    completed = Column(String, default=False)

    completed_at = Column(DateTime, default=lambda: datetime.now(UTC))