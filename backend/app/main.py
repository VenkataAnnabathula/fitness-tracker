"""
FastAPI application entry point.
Tables are created on startup via SQLAlchemy metadata.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.routes import activity, dashboard, meals, weight, users, progress

# Auto-create all tables on startup (fine for POC; use Alembic in production)
Base.metadata.create_all(bind=engine)


def _seed_default_user():
    """Ensure user id=1 exists so all single-user endpoints work out of the box."""
    from app.models.models import User
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.id == 1).first():
            db.add(User(id=1, name="Me"))
            db.commit()
    finally:
        db.close()


_seed_default_user()

app = FastAPI(
    title="Fitness Tracker API",
    description="Personal calorie and fitness tracker",
    version="2.0.0",
)

# Allow the Next.js dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router,     prefix="/api", tags=["Users"])
app.include_router(meals.router,     prefix="/api", tags=["Meals"])
app.include_router(weight.router,    prefix="/api", tags=["Weight"])
app.include_router(activity.router,  prefix="/api", tags=["Activity"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(progress.router,  prefix="/api", tags=["Progress"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
