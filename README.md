# Fitness Tracker — POC

A personal calorie and fitness tracker built as a mobile-first web application.

**Stack:** Next.js · FastAPI · PostgreSQL · SQLAlchemy · LiteLLM (GPT-5 nano)

---

## Folder Structure

```
fitness-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Env-based settings (pydantic-settings)
│   │   ├── database.py          # SQLAlchemy engine + session + Base
│   │   ├── models/
│   │   │   └── models.py        # ORM models (User, FoodMaster, MealLog, …)
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── llm_service.py   # LiteLLM call + prompt
│   │   │   └── nutrition_service.py  # Food lookup + macro calculation
│   │   └── routes/
│   │       ├── meals.py         # POST /parse-meal, POST /meals, GET /meals/{date}
│   │       ├── weight.py        # POST /weight, GET /weight/history
│   │       ├── activity.py      # POST /activity, GET /activity/history
│   │       └── dashboard.py     # GET /dashboard/{date}
│   ├── scripts/
│   │   └── seed_food_master.py  # Populate food_master with ~60 common foods
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx       # Root layout + NavBar
│       │   ├── page.tsx         # Dashboard (/)
│       │   ├── add-meal/        # NLP meal entry flow
│       │   ├── add-weight/      # Daily weight form
│       │   ├── add-activity/    # Activity logging form
│       │   └── history/         # Weight + activity history tabs
│       ├── components/
│       │   ├── NavBar.tsx       # Fixed bottom navigation (mobile-first)
│       │   ├── DashboardCard.tsx
│       │   └── ParsedMealTable.tsx  # Editable parsed items table
│       └── lib/
│           └── api.ts           # Typed fetch wrappers for all endpoints
│
└── README.md
```

---

## Prerequisites

| Tool       | Version  | Install |
|------------|----------|---------|
| Python     | 3.11+    | python.org |
| Node.js    | 20+      | nodejs.org |
| PostgreSQL | 15+      | postgresql.org |
| pgAdmin 4  | latest   | pgadmin.org (optional but recommended) |

---

## 1. PostgreSQL Setup

### Create the database

```sql
-- Connect as postgres superuser, then:
CREATE DATABASE fitness_tracker;
CREATE USER fitness_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE fitness_tracker TO fitness_user;
```

Or use pgAdmin: right-click Databases → Create → Database → name it `fitness_tracker`.

---

## 2. Backend Setup

```bash
cd fitness-tracker/backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Edit .env and set:
#   DATABASE_URL=postgresql://fitness_user:yourpassword@localhost:5432/fitness_tracker
#   OPENAI_API_KEY=sk-...
#   LLM_MODEL=openai/gpt-4o-mini   (or openai/gpt-5-nano when available)
```

### Create tables + seed food data

```bash
# Tables are auto-created on first server start.
# Run the server once first, then seed:

uvicorn app.main:app --reload --port 8000

# In a new terminal (with venv active):
cd fitness-tracker/backend
python -m scripts.seed_food_master
```

You should see: `✓ Seeded 60 foods and default user.`

---

## 3. Frontend Setup

```bash
cd fitness-tracker/frontend

npm install

copy .env.example .env.local     # Windows
# cp .env.example .env.local     # macOS/Linux

# .env.local already has: NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 4. Running Locally

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd fitness-tracker/backend
venv\Scripts\activate          # Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```bash
cd fitness-tracker/frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/health

Open http://localhost:3000 on your iPhone (replace `localhost` with your machine's local IP,
e.g. `http://192.168.1.x:3000`) for mobile testing.

---

## 5. pgAdmin Connection

1. Open pgAdmin 4
2. Right-click **Servers** → **Register** → **Server**
3. **General tab** → Name: `Fitness Tracker Local`
4. **Connection tab**:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance DB: `fitness_tracker`
   - Username: `fitness_user` (or `postgres`)
   - Password: your password
5. Click **Save**

You can now browse tables under:
`Servers → Fitness Tracker Local → Databases → fitness_tracker → Schemas → public → Tables`

---

## 6. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/parse-meal` | LLM parses raw meal text → structured JSON |
| POST | `/api/meals` | Save confirmed meal (nutrition from food_master) |
| GET  | `/api/meals/{date}` | All meals for a date (`?user_id=1`) |
| POST | `/api/weight` | Log daily weight |
| GET  | `/api/weight/history` | Weight history (`?user_id=1&limit=30`) |
| POST | `/api/activity` | Log activity |
| GET  | `/api/activity/history` | Activity history |
| GET  | `/api/dashboard/{date}` | Full daily summary |

Full interactive docs at: http://localhost:8000/docs

---

## 7. cURL Test Examples

### Parse a meal (LLM call)
```bash
curl -X POST http://localhost:8000/api/parse-meal \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "I ate 2 boiled eggs, 1 banana, and 1 cup chicken curry with rice",
    "meal_type": "lunch",
    "user_id": 1
  }'
```

Expected response:
```json
{
  "meal_type": "lunch",
  "items": [
    {"food_name": "boiled egg", "quantity": 2, "unit": "count", "notes": null},
    {"food_name": "banana",     "quantity": 1, "unit": "count", "notes": null},
    {"food_name": "chicken curry", "quantity": 1, "unit": "cup", "notes": null},
    {"food_name": "white rice", "quantity": 1, "unit": "cup",   "notes": null}
  ],
  "notes": null
}
```

### Save confirmed meal
```bash
curl -X POST http://localhost:8000/api/meals \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "meal_date": "2026-03-14",
    "meal_type": "lunch",
    "raw_input_text": "2 boiled eggs, 1 banana, 1 cup chicken curry with rice",
    "items": [
      {"food_name": "boiled egg",    "quantity": 2, "unit": "count"},
      {"food_name": "banana",        "quantity": 1, "unit": "count"},
      {"food_name": "chicken curry", "quantity": 1, "unit": "cup"},
      {"food_name": "white rice",    "quantity": 1, "unit": "cup"}
    ]
  }'
```

### Log weight
```bash
curl -X POST http://localhost:8000/api/weight \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "log_date": "2026-03-14", "weight_kg": 72.5}'
```

### Log activity
```bash
curl -X POST http://localhost:8000/api/activity \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "log_date": "2026-03-14",
    "activity_type": "Running",
    "duration_min": 30,
    "calories_burned": 280,
    "notes": "Morning run"
  }'
```

### Get dashboard
```bash
curl "http://localhost:8000/api/dashboard/2026-03-14?user_id=1"
```

---

## 8. How the Meal Flow Works

```
User types: "2 boiled eggs and 1 cup dal for lunch"
     │
     ▼
POST /api/parse-meal
     │
     ├── LiteLLM (GPT-4o-mini / GPT-5 nano)
     │   Returns strict JSON: [{food_name, quantity, unit}, ...]
     │   ← NO nutrition data from LLM
     │
     ▼
Frontend shows editable table — user can fix any errors
     │
     ▼
POST /api/meals (confirmed items)
     │
     ├── nutrition_service.find_food() → looks up food_master
     ├── nutrition_service.calculate_item_nutrition() → scales macros by quantity
     ├── Saves meal_log + meal_items to PostgreSQL
     │
     ▼
Returns: total_calories, total_protein, total_carbs, total_fats
```

---

## Known Limitations (POC)

1. **No authentication** — single user only (`user_id=1` hardcoded)
2. **Simple food matching** — substring match may return wrong results for ambiguous names;
   no ML-based fuzzy matching or embedding search
3. **No unit conversion** — assumes the user's logged unit matches the food_master serving unit
   (e.g. logging "1 cup rice" when food_master stores rice per cup works; "200g rice" does not)
4. **LLM cost** — every parse call costs money; no caching or deduplication
5. **No offline support** — requires active internet connection for LLM calls
6. **No data validation on weights/units** — trusts user input for quantities
7. **Tables auto-created** — no migration history; schema changes require manual ALTER TABLE
8. **No error recovery on partial LLM failures** — if the JSON is partially malformed,
   the whole parse fails

---

## Recommended Phase 2 Improvements

### Data & Matching
- [ ] Add fuzzy matching with `rapidfuzz` or full-text search in PostgreSQL
- [ ] Embedding-based food search (store food embeddings, use cosine similarity)
- [ ] Let users add custom foods to food_master from the UI
- [ ] Track unmatched foods and surface them as a "needs review" queue

### LLM & Cost
- [ ] Cache parsed results for identical inputs (Redis or simple DB cache)
- [ ] Batch parse multiple meals in one LLM call
- [ ] Switch to GPT-5 nano when available for ~10× cost reduction
- [ ] Add LLM response logging for debugging and prompt improvement

### Auth & Multi-user
- [ ] Add JWT authentication (FastAPI-Users or Auth0)
- [ ] Per-user food_master customization

### UX
- [ ] Add PWA manifest + service worker for "Add to Home Screen" on iPhone
- [ ] Calorie goal setting and daily progress bar
- [ ] Quick-add from recent meals
- [ ] Meal templates (e.g., "usual breakfast")
- [ ] Weight trend chart (recharts or Chart.js)

### Infrastructure
- [ ] Alembic migrations instead of `create_all`
- [ ] Docker Compose for one-command local setup
- [ ] Basic CI (GitHub Actions: lint + test)
- [ ] Structured logging (structlog)

---

## Cost-Conscious Tips

| Tip | Saving |
|-----|--------|
| Use `gpt-4o-mini` or `gpt-5-nano` instead of GPT-4 | ~20–50× cheaper per parse |
| Set `max_tokens=800` on LLM calls (already done) | Avoids runaway costs |
| Cache identical meal text parses for 24h | Eliminates duplicate LLM calls |
| Run PostgreSQL locally (not RDS) for POC | $0 vs ~$25/month |
| Use `temperature=0.1` (already done) | Shorter, more deterministic outputs |
| Log token usage with `litellm.success_callback` | Spot cost anomalies early |
