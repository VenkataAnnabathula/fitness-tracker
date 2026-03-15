"use client";

import { useState } from "react";
import ParsedMealTable from "@/components/ParsedMealTable";
import { parseMeal, saveMeal, ParsedMealItem, MealLogOut } from "@/lib/api";

type Step = "input" | "review" | "saved";

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function AddMealPage() {
  // ── Step 1: input state ──────────────────────────────────────────────────
  const [rawText, setRawText] = useState("");
  const [mealType, setMealType] = useState("");
  const [mealDate, setMealDate] = useState(toISODate(new Date()));

  // ── Step 2: review state ─────────────────────────────────────────────────
  const [parsedItems, setParsedItems] = useState<ParsedMealItem[]>([]);
  const [confirmedMealType, setConfirmedMealType] = useState("");
  const [parseNotes, setParseNotes] = useState<string | null>(null);

  // ── Shared ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedMeal, setSavedMeal] = useState<MealLogOut | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await parseMeal(rawText, mealType || undefined);
      setParsedItems(result.items);
      setConfirmedMealType(result.meal_type || mealType || "");
      setParseNotes(result.notes || null);
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof ParsedMealItem, raw: string) => {
    setParsedItems((prev) => {
      const next = [...prev];
      if (field === "quantity") {
        next[index] = { ...next[index], quantity: parseFloat(raw) || 0 };
      } else {
        next[index] = { ...next[index], [field]: raw };
      }
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (parsedItems.length === 0) {
      setError("Add at least one food item.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await saveMeal({
        meal_date: mealDate,
        meal_type: confirmedMealType || null,
        raw_input_text: rawText,
        items: parsedItems.map(({ food_name, quantity, unit }) => ({ food_name, quantity, unit })),
      });
      setSavedMeal(result);
      setStep("saved");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRawText("");
    setMealType("");
    setParsedItems([]);
    setConfirmedMealType("");
    setParseNotes(null);
    setStep("input");
    setError("");
    setSavedMeal(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Add Meal</h1>
        <p className="page-subtitle">Describe your meal in plain English</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Step 1: text input ── */}
      {step === "input" && (
        <div className="card">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={mealDate} onChange={(e) => setMealDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Meal Type (optional — AI will infer)</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="">Let AI decide</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="form-group">
            <label>What did you eat?</label>
            <textarea
              rows={4}
              placeholder="e.g. 2 boiled eggs, 1 banana, and 1 cup chicken curry with rice"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleParse}
            disabled={loading || !rawText.trim()}
          >
            {loading ? <><span className="spinner" /> Parsing…</> : "Parse Meal →"}
          </button>
        </div>
      )}

      {/* ── Step 2: review & edit parsed items ── */}
      {step === "review" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div className="section-title" style={{ margin: 0 }}>Review Items</div>
            <select
              value={confirmedMealType}
              onChange={(e) => setConfirmedMealType(e.target.value)}
              style={{ width: "auto", fontSize: "14px", padding: "6px 10px" }}
            >
              <option value="">No type</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {parseNotes && <div className="alert-warn">⚠ {parseNotes}</div>}

          <ParsedMealTable
            items={parsedItems}
            onChange={handleItemChange}
            onRemove={handleRemoveItem}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button className="btn btn-secondary" onClick={reset}>← Back</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || parsedItems.length === 0}
            >
              {loading ? <><span className="spinner" /> Saving…</> : "Confirm & Save"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: success ── */}
      {step === "saved" && savedMeal && (
        <div className="card">
          <div className="success-screen">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Meal Saved!</h2>
            <p className="success-sub">
              {savedMeal.total_calories} kcal &nbsp;·&nbsp;
              {savedMeal.total_protein}g protein &nbsp;·&nbsp;
              {savedMeal.total_carbs}g carbs &nbsp;·&nbsp;
              {savedMeal.total_fats}g fat
            </p>
            {savedMeal.items.some((i) => i.calories === 0) && (
              <div className="alert-warn" style={{ textAlign: "left", marginBottom: "16px" }}>
                ⚠ Some foods were not found in the database (shown as 0 kcal).
                Consider adding them to food_master.
              </div>
            )}
            <button className="btn btn-primary" onClick={reset}>
              Add Another Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
