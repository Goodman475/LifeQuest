from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.database.db import engine
from app.database.base import Base

from app.routes.auth import router as auth_router
from app.routes.quest import router as quest_router

from app.database.init_db import init_db

from app.models.user import User
from app.models.skill import Skill
from app.models.quest import Quest
from app.models.user_quest import UserQuest

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router)
app.include_router(quest_router)

@app.get("/")
def root():
    return {"message": "LifeQuest API is running!"}