"""
Pydantic schemas — used for request validation and response serialization.
Kept in a single file for POC simplicity; split by domain in production.
"""
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


# ── User ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    activity_level: Optional[float] = 1.55
    goal: Optional[str] = "maintain"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    activity_level: Optional[float] = None
    goal: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    age: Optional[int]
    gender: Optional[str]
    weight_kg: Optional[float]
    height_cm: Optional[float]
    waist_cm: Optional[float]
    activity_level: Optional[float]
    goal: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── LLM Parsing ──────────────────────────────────────────────────────────────

class ParseMealRequest(BaseModel):
    raw_text: str
    meal_type: Optional[str] = None  # hint; LLM may override
    user_id: int = 1


class ParsedMealItem(BaseModel):
    food_name: str
    quantity: float
    unit: str
    notes: Optional[str] = None


class ParsedMealResponse(BaseModel):
    meal_type: Optional[str] = None
    items: List[ParsedMealItem]
    notes: Optional[str] = None


# ── Save Meal (confirmed by user after review) ────────────────────────────────

class ConfirmedMealItem(BaseModel):
    food_name: str
    quantity: float
    unit: str
    # Optionally pass food_id if the user explicitly selected a match
    food_id: Optional[int] = None


class SaveMealRequest(BaseModel):
    user_id: int = 1
    meal_date: date
    meal_type: Optional[str] = None
    raw_input_text: str
    items: List[ConfirmedMealItem]


# ── Meal Responses ────────────────────────────────────────────────────────────

class MealItemOut(BaseModel):
    id: int
    parsed_food_name: str
    quantity: float
    unit: str
    calories: float
    protein: float
    carbs: float
    fats: float
    food_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class MealLogOut(BaseModel):
    id: int
    meal_date: date
    meal_type: Optional[str]
    raw_input_text: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    items: List[MealItemOut]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Weight ────────────────────────────────────────────────────────────────────

class WeightLogCreate(BaseModel):
    user_id: int = 1
    log_date: date
    weight_kg: float


class WeightLogOut(BaseModel):
    id: int
    log_date: date
    weight_kg: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Activity ──────────────────────────────────────────────────────────────────

class ActivityLogCreate(BaseModel):
    user_id: int = 1
    log_date: date
    activity_type: str
    duration_min: int
    calories_burned: float
    notes: Optional[str] = None


class ActivityLogOut(BaseModel):
    id: int
    log_date: date
    activity_type: str
    duration_min: int
    calories_burned: float
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardOut(BaseModel):
    date: date
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    calories_burned: float
    net_calories: float
    weight_kg: Optional[float]
    meals: List[MealLogOut]
    activities: List[ActivityLogOut]


# ── Progress (multi-day chart data) ───────────────────────────────────────────

class ProgressDayOut(BaseModel):
    date: date
    calories_in: float
    calories_burned: float
    net_calories: float
    protein: float
    carbs: float
    fats: float
    weight_kg: Optional[float]
