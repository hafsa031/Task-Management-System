from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api import auth
from app.api import tasks
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")

# Allow all hosts so Render proxy headers don't trigger 400 Bad Request on OPTIONS
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["*"]
)

# Comprehensive CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "Task Management System API is running"}