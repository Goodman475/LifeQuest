from app.database.base import Base
from app.database.db import engine
from app.models import user
from app.models import quest
from app.models import user_quest
from app.models import daily_quest
from app.models import user_custom_quest
from app.models import feedback

def init_db():
    Base.metadata.create_all(bind=engine)
