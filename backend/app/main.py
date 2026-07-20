from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.db import engine
from app.database.base import Base
from app.database.init_db import init_db

from app.routes.auth import router as auth_router
from app.routes.quest import router as quest_router
from app.routes.home import router as home_router
from app.routes.feedback import router as feedback_router
from app.routes.leaderboard import router as leaderboard_router
from app.routes.users import router as users_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(quest_router)
app.include_router(home_router)
app.include_router(feedback_router)
app.include_router(leaderboard_router)
app.include_router(users_router)

@app.get("/")
def root():
    return {"message": "LifeQuest API is running!"}