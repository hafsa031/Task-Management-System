from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.api import tasks  # Import routers from the api package
from app.core.database import engine, Base

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")

# CORS Setup - Explicitly defining origins (Wildcard ["*"] fails when allow_credentials=True)
origins = [
    "https://task-management-system-8o3d.vercel.app",  # Your live Vercel frontend
    "http://localhost:3000",                         # For local React testing
    "http://localhost:5173",                         # For local Vite testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {
        "message": "Task Management System API is running with clean architecture"
    }