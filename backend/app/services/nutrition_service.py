"""
Nutrition service — food matching and macro calculation.

Strategy:
1. Exact normalized match on food_master.normalized_name
2. Substring match (normalized query contained in normalized_name)
3. Alias scan (comma-separated aliases column)

Nutrition is scaled linearly from food_master serving size.
This is intentionally simple for the POC.
"""
import re
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.models.models import FoodMaster


def find_food(db: Session, food_name: str) -> Optional[FoodMaster]:
    """
    Try to match food_name to a food_master row.
    Returns the best match or None if nothing found.
    """
    query = _normalize(food_name)

    # 1. Exact normalized match
    food = db.query(FoodMaster).filter(FoodMaster.normalized_name == query).first()
    if food:
        return food

    # 2. Normalized name contains the query
    food = db.query(FoodMaster).filter(
        FoodMaster.normalized_name.contains(query)
    ).first()
    if food:
        return food

    # 3. Query is contained in the normalized name (reverse substring)
    food = db.query(FoodMaster).filter(
        FoodMaster.normalized_name.contains(query[:6])  # use first 6 chars
    ).first()
    if food:
        return food

    # 4. Scan aliases — only done when the above fail (rare)
    all_foods = db.query(FoodMaster).all()
    for f in all_foods:
        if not f.aliases:
            continue
        alias_list = [_normalize(a) for a in f.aliases.split(",")]
        # Exact alias match
        if query in alias_list:
            return f
        # Partial alias match
        for alias in alias_list:
            if query in alias or alias in query:
                return f

    return None


def calculate_item_nutrition(
    food: FoodMaster,
    quantity: float,
    unit: str,  # noqa: ARG001 — reserved for future unit conversion
) -> Tuple[float, float, float, float]:
    """
    Scale food_master nutrition values by the given quantity.
    Returns (calories, protein, carbs, fats).

    Linear scaling: multiplier = quantity / serving_size
    Unit conversion is not implemented in this POC — assumes the user's
    unit is consistent with the food_master serving_unit (e.g. both 'count').
    """
    if food.serving_size and food.serving_size > 0:
        multiplier = quantity / food.serving_size
    else:
        multiplier = quantity

    return (
        round(food.calories * multiplier, 1),
        round(food.protein * multiplier, 1),
        round(food.carbs * multiplier, 1),
        round(food.fats * multiplier, 1),
    )


# ── Internal helpers ──────────────────────────────────────────────────────────

def _normalize(name: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    name = name.lower().strip()
    name = re.sub(r"[^a-z0-9\s]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name
