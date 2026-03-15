"""
Seed script: populates food_master with common Indian and international foods.

Run from the backend/ directory:
    python -m scripts.seed_food_master

Nutrition values are approximate and sourced from USDA / standard references.
Serving sizes match what a typical user would log (1 egg, 1 cup rice, etc.).
"""
import sys
import os

# Allow running as: python -m scripts.seed_food_master from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base  # noqa: E402
from app.models.models import FoodMaster, User         # noqa: E402

Base.metadata.create_all(bind=engine)

# fmt: off
# (food_name, normalized_name, aliases, serving_size, serving_unit, calories, protein, carbs, fats)
FOODS = [
    # ── Eggs & Dairy ──────────────────────────────────────────────────────────
    ("Boiled Egg",        "boiled egg",        "egg,hard boiled egg,boiled eggs,whole egg", 1,   "count",   77,  6.3,  0.6,  5.3),
    ("Scrambled Egg",     "scrambled egg",     "scrambled eggs",                           1,   "count",   91,  6.1,  1.1,  6.7),
    ("Omelette",          "omelette",          "omelet,egg omelet",                        1,   "count",  154, 10.6,  1.6, 11.8),
    ("Milk",              "milk",              "whole milk,cows milk,full fat milk",       1,   "cup",    149,  8.0, 12.0,  8.0),
    ("Skimmed Milk",      "skimmed milk",      "skim milk,low fat milk",                   1,   "cup",     83,  8.3, 12.2,  0.2),
    ("Curd",              "curd",              "yogurt,dahi,plain yogurt,set curd",        1,   "cup",    149,  8.5, 11.4,  8.0),
    ("Paneer",            "paneer",            "cottage cheese,indian cottage cheese",     100, "gram",   265, 18.3,  3.4, 20.8),
    ("Butter",            "butter",            "salted butter",                            1,   "tbsp",   102,  0.1,  0.0, 11.5),
    ("Ghee",              "ghee",              "clarified butter,desi ghee",               1,   "tbsp",   112,  0.0,  0.0, 12.7),

    # ── Grains & Breads ───────────────────────────────────────────────────────
    ("White Rice",        "white rice",        "rice,cooked rice,steamed rice,plain rice", 1,  "cup",    206,  4.3, 44.5,  0.4),
    ("Brown Rice",        "brown rice",        "whole grain rice",                         1,   "cup",    216,  5.0, 44.8,  1.8),
    ("Roti",              "roti",              "chapati,wheat roti,phulka,whole wheat roti",1, "count",  104,  3.1, 18.0,  2.6),
    ("Paratha",           "paratha",           "plain paratha,layered paratha",            1,   "count",  260,  5.0, 36.0, 10.0),
    ("Aloo Paratha",      "aloo paratha",      "potato paratha,stuffed paratha",           1,   "count",  320,  7.0, 48.0, 11.0),
    ("Bread",             "bread",             "white bread,sandwich bread,toast",         1,   "slice",   79,  2.7, 15.0,  1.0),
    ("Whole Wheat Bread", "whole wheat bread", "brown bread,multigrain bread",             1,   "slice",   81,  4.0, 14.0,  1.1),
    ("Oats",              "oats",              "rolled oats,oatmeal,porridge",             1,   "cup",    307, 10.7, 55.0,  5.3),
    ("Poha",              "poha",              "flattened rice,beaten rice,aval",          1,   "cup",    160,  3.0, 32.0,  3.0),
    ("Upma",              "upma",              "semolina upma,rava upma",                  1,   "cup",    180,  5.0, 32.0,  4.0),
    ("Pulao",             "pulao",             "vegetable pulao,veg pulao,pilaf",          1,   "cup",    220,  6.0, 42.0,  4.0),
    ("Biryani",           "biryani",           "chicken biryani,veg biryani,mutton biryani",1, "cup",   325, 14.0, 55.0,  7.0),

    # ── South Indian ──────────────────────────────────────────────────────────
    ("Idli",              "idli",              "steamed idli",                             1,   "count",   58,  2.1, 11.0,  0.4),
    ("Dosa",              "dosa",              "plain dosa,crispy dosa",                   1,   "count",  133,  3.8, 19.0,  4.7),
    ("Masala Dosa",       "masala dosa",       "masala dose",                              1,   "count",  215,  5.5, 31.0,  8.0),
    ("Rava Dosa",         "rava dosa",         "semolina dosa,instant dosa",              1,   "count",  165,  4.5, 25.0,  5.5),
    ("Uttapam",           "uttapam",           "uthappam,vegetable uttapam",               1,   "count",  107,  3.3, 18.0,  2.5),
    ("Medu Vada",         "medu vada",         "vada,urad dal vada",                       1,   "count",   97,  3.3, 13.0,  4.0),
    ("Sambar",            "sambar",            "dal sambar,vegetable sambar",              1,   "cup",    110,  6.0, 18.0,  2.0),
    ("Peanut Chutney",    "peanut chutney",    "groundnut chutney",                        2,   "tbsp",    94,  3.9,  3.7,  7.9),
    ("Coconut Chutney",   "coconut chutney",   "thengai chutney",                          2,   "tbsp",    75,  1.0,  4.0,  6.5),

    # ── Lentils & Legumes ─────────────────────────────────────────────────────
    ("Dal",               "dal",               "toor dal,dal tadka,yellow dal,lentil soup,dal fry", 1, "cup", 230, 16.0, 39.0, 1.0),
    ("Rajma",             "rajma",             "kidney beans,rajma curry,red kidney beans", 1,  "cup",   225, 15.2, 40.4,  0.9),
    ("Chana Masala",      "chana masala",      "chole,chickpea curry,chhole",              1,   "cup",   269, 14.5, 45.0,  4.5),
    ("Moong Dal",         "moong dal",         "green gram dal,mung dal",                  1,   "cup",   212, 14.2, 38.6,  0.8),

    # ── Vegetables ───────────────────────────────────────────────────────────
    ("Aloo Sabzi",        "aloo sabzi",        "potato curry,aloo curry,potato subzi",     1,   "cup",   190,  4.0, 32.0,  6.0),
    ("Mixed Veg Curry",   "mixed veg curry",   "vegetable curry,sabzi",                    1,   "cup",   125,  4.5, 18.0,  4.0),
    ("Palak Paneer",      "palak paneer",      "spinach paneer,saag paneer",               1,   "cup",   280, 15.0, 14.0, 18.0),
    ("Bhindi",            "bhindi",            "okra,ladys finger,bhindi masala",          1,   "cup",    86,  3.2, 12.0,  3.5),
    ("Baingan Bharta",    "baingan bharta",    "eggplant curry,brinjal bharta",            1,   "cup",   120,  3.5, 16.0,  5.0),

    # ── Chicken & Meat ────────────────────────────────────────────────────────
    ("Chicken Breast",    "chicken breast",    "grilled chicken,baked chicken,plain chicken", 100, "gram", 165, 31.0,  0.0,  3.6),
    ("Chicken Curry",     "chicken curry",     "chicken masala,murgh curry",               1,   "cup",   285, 28.0,  8.0, 15.0),
    ("Butter Chicken",    "butter chicken",    "murgh makhani,chicken makhani",            1,   "cup",   320, 25.0, 12.0, 18.0),
    ("Tandoori Chicken",  "tandoori chicken",  "tandoori murgh",                           1,   "piece", 195, 28.0,  4.0,  7.0),
    ("Lamb Curry",        "lamb curry",        "mutton curry,gosht curry,mutton masala",   1,   "cup",   320, 30.0,  8.0, 18.0),
    ("Keema",             "keema",             "minced meat,kheema,lamb mince",            1,   "cup",   300, 28.0,  8.0, 16.0),

    # ── Seafood ───────────────────────────────────────────────────────────────
    ("Shrimp",            "shrimp",            "prawns,boiled shrimp,prawn",               100, "gram",   99, 24.0,  0.2,  0.3),
    ("Fish Curry",        "fish curry",        "fish masala,machli curry",                 1,   "cup",   220, 25.0,  5.0,  9.0),

    # ── Fruits ───────────────────────────────────────────────────────────────
    ("Banana",            "banana",            "ripe banana",                              1,   "count",  89,  1.1, 23.0,  0.3),
    ("Apple",             "apple",             "green apple,red apple",                    1,   "count",  95,  0.5, 25.0,  0.3),
    ("Orange",            "orange",            "sweet lime,mosambi,citrus",                1,   "count",  62,  1.2, 15.0,  0.2),
    ("Mango",             "mango",             "ripe mango,alphonso mango",                1,   "count", 201,  2.8, 50.0,  1.3),
    ("Papaya",            "papaya",            "paw paw",                                  1,   "cup",    55,  0.9, 14.0,  0.2),
    ("Watermelon",        "watermelon",        "tarbooz",                                  1,   "cup",    46,  0.9, 11.5,  0.2),

    # ── Snacks & Fried ───────────────────────────────────────────────────────
    ("Samosa",            "samosa",            "veggie samosa,potato samosa",              1,   "count", 262,  5.0, 27.0, 15.0),
    ("Pakora",            "pakora",            "bhajiya,onion pakora,veg pakora",          3,   "count", 195,  5.5, 22.0, 10.0),
    ("Pani Puri",         "pani puri",         "golgappa,puchka",                          6,   "count", 150,  2.5, 28.0,  3.5),
    ("Peanuts",           "peanuts",           "groundnuts,roasted peanuts",               30,  "gram",  172,  7.3,  5.0, 14.6),

    # ── Beverages ─────────────────────────────────────────────────────────────
    ("Chai",              "chai",              "tea,masala tea,masala chai,indian tea",    1,   "cup",    26,  0.3,  3.4,  1.3),
    ("Coffee",            "coffee",            "black coffee,filter coffee",               1,   "cup",     5,  0.3,  0.7,  0.1),
    ("Lassi",             "lassi",             "sweet lassi,mango lassi",                  1,   "cup",   160,  5.0, 27.0,  4.0),

    # ── Desserts ──────────────────────────────────────────────────────────────
    ("Gulab Jamun",       "gulab jamun",       "jamun",                                    1,   "count", 143,  2.2, 26.0,  4.0),
    ("Kheer",             "kheer",             "rice pudding,payasam",                     1,   "cup",   300,  7.0, 50.0,  8.0),
]
# fmt: on


def seed():
    db = SessionLocal()
    try:
        existing_count = db.query(FoodMaster).count()
        if existing_count > 0:
            print(f"food_master already has {existing_count} rows. Skipping seed.")
            print("To re-seed, truncate the table first: TRUNCATE food_master RESTART IDENTITY CASCADE;")
            return

        for row in FOODS:
            food_name, normalized_name, aliases, serving_size, serving_unit, cal, pro, carb, fat = row
            db.add(
                FoodMaster(
                    food_name=food_name,
                    normalized_name=normalized_name,
                    aliases=aliases,
                    serving_size=serving_size,
                    serving_unit=serving_unit,
                    calories=cal,
                    protein=pro,
                    carbs=carb,
                    fats=fat,
                )
            )

        # Create default user (user_id=1) used throughout the POC
        if not db.query(User).filter(User.id == 1).first():
            db.add(User(name="Default User", email="user@fitness.local"))

        db.commit()
        print(f"✓ Seeded {len(FOODS)} foods and default user.")

    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
