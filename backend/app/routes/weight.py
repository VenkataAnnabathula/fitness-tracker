"""
Weight routes:
  POST /api/weight         — log or update today's weight
  GET  /api/weight/history — return recent weight history
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import WeightLog
from app.schemas.schemas import WeightLogCreate, WeightLogOut

router = APIRouter()


@router.post("/weight", response_model=WeightLogOut)
def log_weight(request: WeightLogCreate, db: Session = Depends(get_db)):
    """
    Upsert: if a weight entry already exists for this user + date, update it.
    Otherwise create a new one.
    """
    existing = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == request.user_id, WeightLog.log_date == request.log_date)
        .first()
    )
    if existing:
        existing.weight_kg = request.weight_kg
        db.commit()
        db.refresh(existing)
        return existing

    entry = WeightLog(
        user_id=request.user_id,
        log_date=request.log_date,
        weight_kg=request.weight_kg,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/weight/history", response_model=List[WeightLogOut])
def get_weight_history(
    user_id: int = 1,
    limit: int = 30,
    db: Session = Depends(get_db),
):
    """Return up to `limit` most recent weight entries, newest first."""
    return (
        db.query(WeightLog)
        .filter(WeightLog.user_id == user_id)
        .order_by(WeightLog.log_date.desc())
        .limit(limit)
        .all()
    )
