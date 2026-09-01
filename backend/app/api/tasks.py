from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.api import auth

router = APIRouter(tags=["Tasks & AI"])

# Load environment variables and set up Groq Client
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


class AISuggestionRequest(BaseModel):
    title: str


@router.post("/ai/suggest-description")
def suggest_description(
    request: AISuggestionRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    if not request.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Task title cannot be empty"
        )

    prompt = f"""
You are an AI task productivity assistant. For the task titled "{request.title}", provide:
1. A short, practical description (1-2 sentences, clear and actionable, no headings, no quotation marks).
2. A priority level strictly chosen from: "High", "Medium", or "Low".
3. An estimated completion time (e.g., "30 mins", "2 hours", "1 day").

Return your response strictly as a valid JSON object with these exact keys:
{{"description": "...", "priority": "...", "estimated_time": "..."}}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b", 
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_completion_tokens=300
        )

        content = response.choices[0].message.content
        if not content:
            raise Exception("Groq returned an empty response")

        # Clean up any markdown code blocks if the AI accidentally includes them
        clean_content = content.strip()
        if clean_content.startswith("```json"):
            clean_content = clean_content[7:]
        elif clean_content.startswith("```"):
            clean_content = clean_content[3:]
        if clean_content.endswith("```"):
            clean_content = clean_content[:-3]
        clean_content = clean_content.strip()

        ai_data = json.loads(clean_content)

        return {
            "description": ai_data.get("description", request.title).strip(),
            "priority": ai_data.get("priority", "Medium"),
            "estimated_time": ai_data.get("estimated_time", "1 hour")
        }

    except Exception as e:
        # Graceful fallback response instead of failing the request
        return {
            "description": f"Complete tasks related to {request.title}.",
            "priority": "Medium",
            "estimated_time": "1 hour"
        }


@router.get("/tasks", response_model=List[schemas.TaskOut])
def get_tasks(
    skip: int = Query(0, ge=0, description="Number of tasks to skip for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Max number of tasks to return"),
    search: Optional[str] = Query(None, description="Search tasks by title keyword"),
    completed: Optional[bool] = Query(None, description="Filter by completion status (true/false)"),
    sort_by: Optional[str] = Query("newest", description="Sort by: newest, oldest, or title"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Task).filter(models.Task.owner_id == current_user.id)

    if search:
        query = query.filter(models.Task.title.ilike(f"%{search}%"))

    if completed is not None:
        query = query.filter(models.Task.completed == completed)

    if sort_by == "oldest":
        query = query.order_by(models.Task.id.asc())
    elif sort_by == "title":
        query = query.order_by(models.Task.title.asc())
    else: 
        query = query.order_by(models.Task.id.desc())

    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.post("/tasks", response_model=schemas.TaskOut)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_task = models.Task(
        **task.dict(),
        owner_id=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()
    return {"detail": "Task deleted successfully"}