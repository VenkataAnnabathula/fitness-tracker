"""
LLM service — isolates all LiteLLM/OpenAI interaction.
Only responsibility: take raw meal text → return ParsedMealResponse.
No nutrition data is ever requested from the LLM.
"""
import json
import os
import re
from typing import Optional

import litellm

from app.config import get_settings
from app.schemas.schemas import ParsedMealResponse

settings = get_settings()

# Pass Ollama base URL if set
if settings.OLLAMA_API_BASE:
    os.environ["OLLAMA_API_BASE"] = settings.OLLAMA_API_BASE

# Pass Groq API key if set
if settings.GROQ_API_KEY:
    os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY

# ── Prompt ────────────────────────────────────────────────────────────────────
# Keep this prompt isolated so it is easy to iterate without touching service logic.

SYSTEM_PROMPT = (
    "/no_think "
    "You are a meal parsing assistant. "
    "Your ONLY job is to extract food items from the user's meal description. "
    "Always respond with valid JSON. Never add explanations or markdown."
)

MEAL_PARSE_PROMPT = """\
Parse the following meal description and return a JSON object.

STRICT RULES:
1. Return ONLY a valid JSON object — no markdown, no code fences, no prose.
2. NEVER include calories, protein, carbs, fats, or any nutrition data.
3. Extract each distinct food as a separate item.
4. For compound dishes like "chicken curry with rice", create two items:
   "chicken curry" and "white rice".
5. food_name must be a simple, common English name (lowercase preferred).
6. unit must be one of: count, cup, gram, ml, piece, serving, bowl, plate, slice, tbsp, tsp.
7. If a quantity is vague (e.g. "some", "a bit"), use 1 and add a note.
8. Infer meal_type from context: breakfast, lunch, dinner, snack — or null if unclear.
9. Add a top-level "notes" field only if something is ambiguous or worth flagging.

OUTPUT FORMAT (strict):
{{
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack" | null,
  "items": [
    {{
      "food_name": "string",
      "quantity": <number>,
      "unit": "string",
      "notes": "string or null"
    }}
  ],
  "notes": "string or null"
}}

MEAL DESCRIPTION:
{meal_text}
"""


NUTRITION_ESTIMATE_PROMPT = """\
/no_think Estimate the nutrition for the following food item.

STRICT RULES:
1. Return ONLY a valid JSON object — no markdown, no code fences, no prose, no thinking.
2. Estimate for the EXACT quantity and unit given.
3. All values must be numbers (not strings).
4. Be realistic — use standard nutritional references.

Food: {food_name}
Quantity: {quantity} {unit}

OUTPUT FORMAT (strict):
{{
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fats": <number>
}}
"""


# ── Public function ────────────────────────────────────────────────────────────

def parse_meal_with_llm(
    raw_text: str,
    meal_type_hint: Optional[str] = None,
) -> ParsedMealResponse:
    """
    Call the LLM to parse a free-text meal description.

    Returns a ParsedMealResponse on success.
    Raises ValueError with a descriptive message on failure.
    """
    prompt = MEAL_PARSE_PROMPT.format(meal_text=raw_text.strip())
    if meal_type_hint:
        prompt += f"\n\nContext hint: the user indicated this is {meal_type_hint}."

    try:
        extra = {"think": False} if "qwen3" in settings.LLM_MODEL.lower() else {}
        api_base = settings.OLLAMA_API_BASE if settings.LLM_MODEL.startswith("ollama/") else None
        response = litellm.completion(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=800,
            api_base=api_base,
            **({"extra_body": extra} if extra else {}),
        )

        raw_content = response.choices[0].message.content or ""
        raw_content = _strip_code_fences(raw_content)

        if not raw_content:
            raise ValueError("LLM returned an empty response.")

        parsed_dict = json.loads(raw_content)
        return ParsedMealResponse(**parsed_dict)

    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc
    except Exception as exc:
        # Catch LiteLLM errors, network errors, Pydantic validation errors
        raise ValueError(f"Meal parsing failed: {exc}") from exc


def estimate_nutrition_with_llm(
    food_name: str,
    quantity: float,
    unit: str,
) -> dict:
    """
    Ask the LLM to estimate calories/protein/carbs/fats for an unrecognised food.
    Returns a dict with keys: calories, protein, carbs, fats.
    Falls back to zeros on any failure.
    """
    prompt = NUTRITION_ESTIMATE_PROMPT.format(
        food_name=food_name, quantity=quantity, unit=unit
    )
    try:
        extra = {"think": False} if "qwen3" in settings.LLM_MODEL.lower() else {}
        api_base = settings.OLLAMA_API_BASE if settings.LLM_MODEL.startswith("ollama/") else None
        response = litellm.completion(
            model=settings.LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=2000,
            api_base=api_base,
            **({"extra_body": extra} if extra else {}),
        )
        raw = response.choices[0].message.content or ""
        raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
        raw = _strip_code_fences(raw)
        if not raw:
            print(f"[WARN] LLM returned empty content for '{food_name}'. Full response: {response.choices[0].message.content!r}")
            raise ValueError("empty response after stripping think tags")
        data = json.loads(raw)
        return {
            "calories": float(data.get("calories", 0)),
            "protein":  float(data.get("protein", 0)),
            "carbs":    float(data.get("carbs", 0)),
            "fats":     float(data.get("fats", 0)),
        }
    except Exception as exc:
        import traceback
        print(f"[WARN] LLM nutrition estimate failed for '{food_name}': {exc}")
        traceback.print_exc()
        return {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fats": 0.0}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_code_fences(text: str) -> str:
    """
    Safety net: some models wrap their JSON in ```json ... ``` even when told not to.
    Strip those fences so json.loads() doesn't choke.
    """
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()
