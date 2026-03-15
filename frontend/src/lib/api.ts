/**
 * API client — thin wrappers around fetch for each backend endpoint.
 * All calls go through NEXT_PUBLIC_API_URL (default: http://localhost:8000).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Type definitions (mirror Pydantic schemas) ────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  age?: number | null;
  gender?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  waist_cm?: number | null;
  activity_level?: number | null;
  goal?: string | null;
}

export interface ProgressDayOut {
  date: string;
  calories_in: number;
  calories_burned: number;
  net_calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weight_kg?: number | null;
}

export interface ParsedMealItem {
  food_name: string;
  quantity: number;
  unit: string;
  notes?: string | null;
}

export interface ParsedMealResponse {
  meal_type?: string | null;
  items: ParsedMealItem[];
  notes?: string | null;
}

export interface MealItemOut {
  id: number;
  parsed_food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  food_id?: number | null;
}

export interface MealLogOut {
  id: number;
  meal_date: string;
  meal_type?: string | null;
  raw_input_text: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  items: MealItemOut[];
}

export interface WeightLogOut {
  id: number;
  log_date: string;
  weight_kg: number;
}

export interface ActivityLogOut {
  id: number;
  log_date: string;
  activity_type: string;
  duration_min: number;
  calories_burned: number;
  notes?: string | null;
}

export interface DashboardOut {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  calories_burned: number;
  net_calories: number;
  weight_kg?: number | null;
  meals: MealLogOut[];
  activities: ActivityLogOut[];
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse error
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ── Meals ─────────────────────────────────────────────────────────────────────

/** Step 1: send raw text to LLM, get structured items back (no DB write). */
export function parseMeal(rawText: string, mealType?: string): Promise<ParsedMealResponse> {
  return apiFetch("/api/parse-meal", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText, meal_type: mealType || null, user_id: 1 }),
  });
}

/** Step 2: save confirmed meal items to the database. */
export function saveMeal(payload: {
  meal_date: string;
  meal_type?: string | null;
  raw_input_text: string;
  items: { food_name: string; quantity: number; unit: string }[];
}): Promise<MealLogOut> {
  return apiFetch("/api/meals", {
    method: "POST",
    body: JSON.stringify({ ...payload, user_id: 1 }),
  });
}

/** Return all meals for a given date. */
export function getMealsForDate(date: string): Promise<MealLogOut[]> {
  return apiFetch(`/api/meals/${date}?user_id=1`);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function getDashboard(date: string): Promise<DashboardOut> {
  return apiFetch(`/api/dashboard/${date}?user_id=1`);
}

// ── Weight ────────────────────────────────────────────────────────────────────

export function logWeight(log_date: string, weight_kg: number): Promise<WeightLogOut> {
  return apiFetch("/api/weight", {
    method: "POST",
    body: JSON.stringify({ user_id: 1, log_date, weight_kg }),
  });
}

export function getWeightHistory(limit = 30): Promise<WeightLogOut[]> {
  return apiFetch(`/api/weight/history?user_id=1&limit=${limit}`);
}

// ── Activity ──────────────────────────────────────────────────────────────────

export function logActivity(payload: {
  log_date: string;
  activity_type: string;
  duration_min: number;
  calories_burned: number;
  notes?: string;
}): Promise<ActivityLogOut> {
  return apiFetch("/api/activity", {
    method: "POST",
    body: JSON.stringify({ ...payload, user_id: 1 }),
  });
}

export function getActivityHistory(limit = 30): Promise<ActivityLogOut[]> {
  return apiFetch(`/api/activity/history?user_id=1&limit=${limit}`);
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function getProfile(): Promise<UserProfile> {
  return apiFetch("/api/users/1");
}

export function saveProfile(data: Omit<UserProfile, "id">): Promise<UserProfile> {
  return apiFetch("/api/users/1", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Progress ──────────────────────────────────────────────────────────────────

export function getProgress(days = 30): Promise<ProgressDayOut[]> {
  return apiFetch(`/api/progress?user_id=1&days=${days}`);
}
