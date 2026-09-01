from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.api import tasks
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")

# Robust CORS configuration for Vercel + Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Safe when combined with proper wildcard methods/headers
    allow_credentials=False,  # Set to False if you use token-based headers (Bearer token) instead of cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "Task Management System API is running"}