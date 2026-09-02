from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, tasks
from app.core.database import engine, Base


# ==========================================
# CREATE DATABASE TABLES
# ==========================================
Base.metadata.create_all(bind=engine)


# ==========================================
# CREATE FASTAPI APP
# ==========================================
app = FastAPI(
    title="Task Management System"
)


# ==========================================
# CORS CONFIGURATION
# ==========================================
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://task-management-system-8o3d.vercel.app/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# API ROUTES
# ==========================================
app.include_router(auth.router)
app.include_router(tasks.router)


# ==========================================
# ROOT ENDPOINT
# ==========================================
@app.get("/")
def root():
    return {
        "message": "Task Management System API is running"
    }