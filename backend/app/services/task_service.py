from sqlalchemy.orm import Session
from app.models.models import Task  # Make sure this import matches your filename
from app.schemas.schemas import TaskCreate

def get_user_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).all()

def create_user_task(db: Session, task: TaskCreate, user_id: int):
    db_task = Task(**task.dict(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task