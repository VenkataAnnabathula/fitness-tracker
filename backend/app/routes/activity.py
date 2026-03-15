"""
Activity routes:
  POST /api/activity         — log an activity
  GET  /api/activity/history — return recent activity history
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import ActivityLog
from app.schemas.schemas import ActivityLogCreate, ActivityLogOut

router = APIRouter()


@router.post("/activity", response_model=ActivityLogOut)
def log_activity(request: ActivityLogCreate, db: Session = Depends(get_db)):
    """Save a new activity log entry."""
    entry = ActivityLog(
        user_id=request.user_id,
        log_date=request.log_date,
        activity_type=request.activity_type,
        duration_min=request.duration_min,
        calories_burned=request.calories_burned,
        notes=request.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/activity/history", response_model=List[ActivityLogOut])
def get_activity_history(
    user_id: int = 1,
    limit: int = 30,
    db: Session = Depends(get_db),
):
    """Return up to `limit` most recent activity entries, newest first."""
    return (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.log_date.desc())
        .limit(limit)
        .all()
    )
