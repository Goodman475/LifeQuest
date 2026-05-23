from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.base import Base

class Skill(Base):  

    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    strength = Column(Integer, default=0)

    intelligence = Column(Integer, default=0)

    discipline = Column(Integer, default=0)

    finance = Column(Integer, default=0)

    social = Column(Integer, default=0)
