"""
SQLAlchemy ORM models — maps 1-to-1 with PostgreSQL tables.
"""
from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)       # male / female / other
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    activity_level = Column(Float, nullable=True, default=1.55)  # TDEE multiplier
    goal = Column(String(20), nullable=True, default='maintain') # lose/maintain/gain
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meal_logs = relationship("MealLog", back_populates="user")
    weight_logs = relationship("WeightLog", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")


class FoodMaster(Base):
    """
    Master food table. Nutrition values are per serving_size/serving_unit.
    The backend scales these by quantity when a meal item is logged.
    """
    __tablename__ = "food_master"

    id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String(200), nullable=False)
    # Lowercase, punctuation-stripped version used for fuzzy matching
    normalized_name = Column(String(200), nullable=False, index=True)
    # Comma-separated alternate names (e.g. "egg,hard boiled egg")
    aliases = Column(Text, nullable=True)

    serving_size = Column(Float, nullable=False)       # e.g. 1, 100, 0.5
    serving_unit = Column(String(50), nullable=False)  # e.g. count, gram, cup

    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fats = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meal_items = relationship("MealItem", back_populates="food")


class MealLog(Base):
    """
    One meal log per meal (breakfast, lunch, etc.).
    Stores the original free-text and computed totals.
    """
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_date = Column(Date, nullable=False)
    meal_type = Column(String(50), nullable=True)   # breakfast/lunch/dinner/snack
    raw_input_text = Column(Text, nullable=False)   # original user text

    # Pre-computed totals (sum of meal_items)
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fats = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="meal_logs")
    items = relationship("MealItem", back_populates="meal_log", cascade="all, delete-orphan")


class MealItem(Base):
    """
    Individual food item within a meal log.
    food_id may be NULL if the food could not be matched in food_master.
    """
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_log_id = Column(Integer, ForeignKey("meal_logs.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("food_master.id"), nullable=True)

    parsed_food_name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)

    # Nutrition scaled from food_master (0 if food not matched)
    calories = Column(Float, default=0.0)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fats = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meal_log = relationship("MealLog", back_populates="items")
    food = relationship("FoodMaster", back_populates="meal_items")


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    weight_kg = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="weight_logs")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    activity_type = Column(String(100), nullable=False)
    duration_min = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")
