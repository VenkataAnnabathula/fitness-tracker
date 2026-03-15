"""
Progress route:
  GET /api/progress?user_id=1&days=30
  Returns a per-day summary for the last N days (for chart rendering).
"""
from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import ActivityLog, MealLog, WeightLog
from app.schemas.schemas import ProgressDayOut

router = APIRouter()


@router.get("/progress", response_model=List[ProgressDayOut])
def get_progress(
    user_id: int = 1,
    days: int = 30,
    db: Session = Depends(get_db),
):
    today = date.today()
    start = today - timedelta(days=days - 1)

    # Fetch all records in range in bulk
    meals = (
        db.query(MealLog)
        .filter(MealLog.user_id == user_id, MealLog.meal_date >= start)
        .all()
    )
    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id, ActivityLog.log_date >= start)
        .all()
    )
    weights = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == user_id, WeightLog.log_date >= start)
        .all()
    )

    # Index by date
    meal_by_date: dict[date, list] = {}
    for m in meals:
        meal_by_date.setdefault(m.meal_date, []).append(m)

    act_by_date: dict[date, list] = {}
    for a in activities:
        act_by_date.setdefault(a.log_date, []).append(a)

    weight_by_date: dict[date, float] = {w.log_date: w.weight_kg for w in weights}

    result = []
    for i in range(days):
        d = start + timedelta(days=i)
        day_meals = meal_by_date.get(d, [])
        day_acts = act_by_date.get(d, [])

        cal_in = round(sum(m.total_calories for m in day_meals), 1)
        cal_burned = round(sum(a.calories_burned for a in day_acts), 1)

        result.append(ProgressDayOut(
            date=d,
            calories_in=cal_in,
            calories_burned=cal_burned,
            net_calories=round(cal_in - cal_burned, 1),
            protein=round(sum(m.total_protein for m in day_meals), 1),
            carbs=round(sum(m.total_carbs for m in day_meals), 1),
            fats=round(sum(m.total_fats for m in day_meals), 1),
            weight_kg=weight_by_date.get(d),
        ))

    return result
