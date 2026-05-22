from fastapi import FastAPI

from app.database.db import engine
from app.database.base import Base

from app.routes.auth import router as auth_router
from app.database.init_db import init_db

import app.models.user  
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "LifeQuest API is running!"}