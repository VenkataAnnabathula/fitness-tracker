"use client";

import { useEffect, useState } from "react";
import { getProfile, saveProfile, UserProfile } from "@/lib/api";

function calcGoal(p: Partial<UserProfile> & { activity_level?: number; goal?: string }): { tdee: number; target: number } | null {
  if (!p.weight_kg || !p.height_cm || !p.age || !p.gender) return null;
  const base = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age;
  const bmr  = p.gender === "female" ? base - 161 : base + 5;
  const tdee = Math.round(bmr * (p.activity_level ?? 1.55));
  const target = p.goal === "lose" ? tdee - 500 : p.goal === "gain" ? tdee + 200 : tdee;
  return { tdee, target };
}

const ACTIVITY_LEVELS = [
  { value: 1.2,   label: "Sedentary",         sub: "Little or no exercise" },
  { value: 1.375, label: "Lightly active",     sub: "1–3 days/week" },
  { value: 1.55,  label: "Moderately active",  sub: "3–5 days/week" },
  { value: 1.725, label: "Very active",         sub: "6–7 days/week" },
];

const GOALS = [
  { value: "lose",     label: "Lose weight",     sub: "500 kcal daily deficit" },
  { value: "maintain", label: "Maintain weight", sub: "Eat at TDEE" },
  { value: "gain",     label: "Gain muscle",     sub: "200 kcal surplus" },
];

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "", age: "", gender: "", weight_kg: "", height_cm: "", waist_cm: "",
    activity_level: 1.375, goal: "lose",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((p) => setForm({
        name:           p.name === "Me" ? "" : (p.name || ""),
        age:            p.age?.toString() || "",
        gender:         p.gender || "",
        weight_kg:      p.weight_kg?.toString() || "",
        height_cm:      p.height_cm?.toString() || "",
        waist_cm:       p.waist_cm?.toString() || "",
        activity_level: p.activity_level ?? 1.375,
        goal:           p.goal ?? "lose",
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      await saveProfile({
        name:           form.name,
        age:            form.age ? parseInt(form.age) : null,
        gender:         form.gender || null,
        weight_kg:      form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm:      form.height_cm ? parseFloat(form.height_cm) : null,
        waist_cm:       form.waist_cm ? parseFloat(form.waist_cm) : null,
        activity_level: form.activity_level,
        goal:           form.goal,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const stats = calcGoal({
    weight_kg:      form.weight_kg ? parseFloat(form.weight_kg) : undefined,
    height_cm:      form.height_cm ? parseFloat(form.height_cm) : undefined,
    age:            form.age ? parseInt(form.age) : undefined,
    gender:         form.gender || undefined,
    activity_level: form.activity_level,
    goal:           form.goal,
  });

  const initials = form.name ? form.name[0].toUpperCase() : "?";

  return (
    <div className="container">
      <div className="page-header">
        <p className="page-subtitle">Account</p>
        <h1 className="page-title">Profile</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {saved && <div className="alert-success">Changes saved</div>}

      {loading ? (
        <div className="empty" style={{ textAlign: "center", paddingTop: 40 }}>Loading…</div>
      ) : (
        <>
          {/* Avatar + TDEE summary */}
          {stats && (
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
              <div className="avatar">{initials}</div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 300, color: "var(--t1)", letterSpacing: -0.3 }}>{form.name || "—"}</p>
                <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>TDEE: {stats.tdee.toLocaleString()} kcal/day</p>
                <p style={{ fontSize: 12, color: "var(--rgb1)", marginTop: 2 }}>
                  {form.goal === "lose" ? "Goal: Lose weight" : form.goal === "gain" ? "Goal: Gain muscle" : "Goal: Maintain weight"}
                </p>
              </div>
            </div>
          )}

          {/* Personal */}
          <div className="card">
            <p className="section-title">Personal</p>
            <div className="dual">
              <div>
                <label>Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label>Age</label>
                <input type="number" placeholder="28" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
            </div>
            <label>Gender</label>
            <div className="sel-grid sel-grid-3">
              {["Male","Female","Other"].map((g) => (
                <button key={g} className={`sel-btn${form.gender === g.toLowerCase() ? " on" : ""}`}
                  style={{ textAlign: "center" }}
                  onClick={() => setForm({ ...form, gender: g.toLowerCase() })}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Body stats */}
          <div className="card">
            <p className="section-title">Body stats</p>
            <div className="triple">
              <div>
                <label>Weight (kg)</label>
                <input type="number" step="0.1" placeholder="72" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
              </div>
              <div>
                <label>Height (cm)</label>
                <input type="number" placeholder="175" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} />
              </div>
              <div>
                <label>Waist (cm)</label>
                <input type="number" placeholder="82" value={form.waist_cm} onChange={(e) => setForm({ ...form, waist_cm: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Activity level */}
          <div className="card">
            <p className="section-title">Activity level</p>
            <div className="sel-grid">
              {ACTIVITY_LEVELS.map((al) => (
                <button key={al.value} className={`sel-btn${form.activity_level === al.value ? " on" : ""}`}
                  onClick={() => setForm({ ...form, activity_level: al.value })}>
                  <div className="sel-btn-title">{al.label}</div>
                  <div className="sel-btn-sub">{al.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="card">
            <p className="section-title">Your goal</p>
            <div className="sel-grid">
              {GOALS.map((g) => (
                <button key={g.value} className={`sel-btn${form.goal === g.value ? " on" : ""}`}
                  onClick={() => setForm({ ...form, goal: g.value })}>
                  <div className="sel-btn-title">{g.label}</div>
                  <div className="sel-btn-sub">{g.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily targets */}
          {stats && (
            <div className="card">
              <p className="section-title">Daily targets</p>
              <div className="row"><div className="row-name">Calorie goal</div><div className="row-value" style={{ color: "var(--rgb1)", fontFamily: "var(--mono)" }}>{stats.target.toLocaleString()} kcal</div></div>
              <div className="row"><div className="row-name">Protein</div><div className="row-value">{Math.round(stats.target * 0.30 / 4)}g</div></div>
              <div className="row"><div className="row-name">Carbs</div><div className="row-value">{Math.round(stats.target * 0.40 / 4)}g</div></div>
              <div className="row" style={{ borderBottom: "none" }}><div className="row-name">Fat</div><div className="row-value">{Math.round(stats.target * 0.30 / 9)}g</div></div>
            </div>
          )}

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : "Save changes"}
          </button>
        </>
      )}
    </div>
  );
}
