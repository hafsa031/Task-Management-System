```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, tasks
from app.core.database import engine, Base


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Management System")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://task-management-system-8o3d.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/")
def root():
    return {
        "message": "Task Management System API is running"
    }
```
