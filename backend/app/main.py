from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.api import tasks
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")

# Explicit origins list to satisfy browser preflight security checks
origins = [
    "https://task-management-system-8o3d.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "Task Management System API is running"}