"""
Dashboard route:
  GET /api/dashboard/{date} — aggregate daily summary for a user
"""
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import ActivityLog, MealLog, WeightLog
from app.schemas.schemas import DashboardOut

router = APIRouter()


@router.get("/dashboard/{dashboard_date}", response_model=DashboardOut)
def get_dashboard(
    dashboard_date: date,
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """
    Return a full daily snapshot:
    - All meal logs (with items) for the date
    - All activities for the date
    - Weight entry for the date (if logged)
    - Computed totals: calories in, calories burned, net calories, macros
    """
    meals = (
        db.query(MealLog)
        .filter(MealLog.user_id == user_id, MealLog.meal_date == dashboard_date)
        .order_by(MealLog.created_at)
        .all()
    )

    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id, ActivityLog.log_date == dashboard_date)
        .order_by(ActivityLog.created_at)
        .all()
    )

    weight_entry = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == user_id, WeightLog.log_date == dashboard_date)
        .first()
    )

    total_calories = sum(m.total_calories for m in meals)
    total_protein = sum(m.total_protein for m in meals)
    total_carbs = sum(m.total_carbs for m in meals)
    total_fats = sum(m.total_fats for m in meals)
    calories_burned = sum(a.calories_burned for a in activities)
    net_calories = total_calories - calories_burned

    return DashboardOut(
        date=dashboard_date,
        total_calories=round(total_calories, 1),
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fats=round(total_fats, 1),
        calories_burned=round(calories_burned, 1),
        net_calories=round(net_calories, 1),
        weight_kg=weight_entry.weight_kg if weight_entry else None,
        meals=meals,
        activities=activities,
    )
