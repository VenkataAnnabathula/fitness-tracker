"""
Meal routes:
  POST /api/parse-meal  — call LLM, return parsed items (no DB write)
  POST /api/meals       — save confirmed meal, calculate nutrition from food_master
  GET  /api/meals/{date}— return all meals for a date
"""
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import MealItem, MealLog
from app.schemas.schemas import (
    MealLogOut,
    ParsedMealResponse,
    ParseMealRequest,
    SaveMealRequest,
)
from app.services.llm_service import parse_meal_with_llm, estimate_nutrition_with_llm
from app.services.nutrition_service import calculate_item_nutrition, find_food

router = APIRouter()


@router.post("/parse-meal", response_model=ParsedMealResponse)
def parse_meal(request: ParseMealRequest, db: Session = Depends(get_db)):
    """
    Step 1 of meal entry flow.
    Sends raw_text to LiteLLM and returns structured items for user review.
    Nothing is written to the database at this stage.
    """
    try:
        result = parse_meal_with_llm(request.raw_text, request.meal_type)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return result


@router.post("/meals", response_model=MealLogOut)
def save_meal(request: SaveMealRequest, db: Session = Depends(get_db)):
    """
    Step 2 of meal entry flow.
    Receives the user-confirmed list of parsed items, looks each up in food_master,
    calculates nutrition, persists meal_log + meal_items, returns the full record.

    If a food is not found in food_master, nutrition defaults to 0 and food_id is NULL.
    The frontend should surface these as unmatched items so the user can investigate.
    """
    meal_log = MealLog(
        user_id=request.user_id,
        meal_date=request.meal_date,
        meal_type=request.meal_type,
        raw_input_text=request.raw_input_text,
        total_calories=0.0,
        total_protein=0.0,
        total_carbs=0.0,
        total_fats=0.0,
    )
    db.add(meal_log)
    db.flush()  # obtain meal_log.id before inserting children

    total_cal = total_pro = total_carb = total_fat = 0.0
    unmatched: List[str] = []

    for item in request.items:
        food = find_food(db, item.food_name)
        if food:
            cal, pro, carb, fat = calculate_item_nutrition(food, item.quantity, item.unit)
            food_id = food.id
        else:
            # Food not in master — ask LLM to estimate nutrition
            est = estimate_nutrition_with_llm(item.food_name, item.quantity, item.unit)
            cal, pro, carb, fat = est["calories"], est["protein"], est["carbs"], est["fats"]
            food_id = None
            unmatched.append(item.food_name)

        db.add(
            MealItem(
                meal_log_id=meal_log.id,
                food_id=food_id,
                parsed_food_name=item.food_name,
                quantity=item.quantity,
                unit=item.unit,
                calories=cal,
                protein=pro,
                carbs=carb,
                fats=fat,
            )
        )

        total_cal += cal
        total_pro += pro
        total_carb += carb
        total_fat += fat

    meal_log.total_calories = round(total_cal, 1)
    meal_log.total_protein = round(total_pro, 1)
    meal_log.total_carbs = round(total_carb, 1)
    meal_log.total_fats = round(total_fat, 1)

    db.commit()
    db.refresh(meal_log)

    if unmatched:
        # Log for visibility; in production this could be a structured warning field
        print(f"[INFO] Foods not in food_master (nutrition estimated by LLM): {unmatched}")

    return meal_log


@router.get("/meals/{meal_date}", response_model=List[MealLogOut])
def get_meals_by_date(
    meal_date: date,
    user_id: int = 1,
    db: Session = Depends(get_db),
):
    """Return all meal logs for a given date, including their items."""
    return (
        db.query(MealLog)
        .filter(MealLog.user_id == user_id, MealLog.meal_date == meal_date)
        .order_by(MealLog.created_at)
        .all()
    )
