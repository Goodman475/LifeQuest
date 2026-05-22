from app.database.base import Base
from app.database.db import engine

from app.models import user  

def init_db():
    Base.metadata.create_all(bind=engine)