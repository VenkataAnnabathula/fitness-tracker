"use client";

import { useState } from "react";
import Link from "next/link";
import { logActivity } from "@/lib/api";

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

const ACTIVITIES = [
  { name: "Running",  rate: 10, icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="1.5"/><path d="M7 21l3-6 2 2 3-4 3 5M6 13l2-4 4 2 2-4"/></svg> },
  { name: "Cycling",  rate: 8,  icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="15" r="3"/><circle cx="18" cy="15" r="3"/><path d="M6 15l3-6h5l2 3M14 9l2 3"/></svg> },
  { name: "Swimming", rate: 9,  icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="14" cy="6" r="2"/></svg> },
  { name: "Walking",  rate: 4,  icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M9 20l1-5 2 2 1-5M8 10l1-3 4 1 2 3"/></svg> },
  { name: "Strength", rate: 7,  icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 5h2v14H6zM16 5h2v14h-2zM8 12h8M3 7h3M18 7h3M3 17h3M18 17h3"/></svg> },
  { name: "Yoga",     rate: 3,  icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M8 18l4-8 4 8M4 12c2 0 4-1 4-3M20 12c-2 0-4-1-4-3"/></svg> },
  { name: "HIIT",     rate: 12, icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 2 13 9 13 9 22 22 11 15 11"/></svg> },
  { name: "Other",    rate: 6,  icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg> },
];

export default function AddActivityPage() {
  const [logDate, setLogDate] = useState(toISODate(new Date()));
  const [selected, setSelected] = useState(ACTIVITIES[0]);
  const [duration, setDuration] = useState("30");
  const [calories, setCalories] = useState(String(ACTIVITIES[0].rate * 30));
  const [steps, setSteps] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const selectActivity = (act: typeof ACTIVITIES[0]) => {
    setSelected(act);
    setCalories(String(act.rate * (parseInt(duration) || 30)));
  };

  const handleDurationChange = (val: string) => {
    setDuration(val);
    setCalories(String(selected.rate * (parseInt(val) || 0)));
  };

  const handleStepsChange = (val: string) => {
    setSteps(val);
    const stepCal = Math.round((parseInt(val) || 0) * 0.04);
    if (stepCal > 0) setCalories(String(stepCal));
  };

  const handleSave = async () => {
    if (!duration || parseInt(duration) <= 0) { setError("Enter a valid duration."); return; }
    if (!calories || parseFloat(calories) <= 0) { setError("Enter calories burned."); return; }
    setLoading(true); setError("");
    try {
      await logActivity({
        log_date: logDate,
        activity_type: selected.name,
        duration_min: parseInt(duration),
        calories_burned: parseFloat(calories),
        notes: notes.trim() || undefined,
      });
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="container">
        <div className="card">
          <div className="success-screen">
            <div className="ok-ring">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <defs><linearGradient id="chk"><stop offset="0%" stopColor="#7b61ff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
                <polyline points="3,10 8,15 17,5" stroke="url(#chk)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">Activity logged</h2>
            <p className="success-sub">{selected.name} · {duration} min · {calories} kcal</p>
            <div className="btn-row">
              <button className="btn btn-outline" onClick={() => { setSaved(false); setNotes(""); }}>Log another</button>
              <Link href="/" className="btn btn-primary">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <p className="page-subtitle">Log exercise</p>
        <h1 className="page-title">Add activity</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        {/* Activity type icons */}
        <p className="section-title" style={{ marginBottom: 10 }}>Activity type</p>
        <div className="act-grid">
          {ACTIVITIES.map((act) => (
            <button
              key={act.name}
              className={`act-btn${selected.name === act.name ? " on" : ""}`}
              onClick={() => selectActivity(act)}
            >
              {act.icon}
              <span className="act-btn-label">{act.name}</span>
            </button>
          ))}
        </div>

        {/* Duration + Calories */}
        <div className="dual">
          <div>
            <label>Duration (min)</label>
            <input type="number" min="1" value={duration}
              onChange={(e) => handleDurationChange(e.target.value)} />
          </div>
          <div>
            <label>Calories burned</label>
            <input type="number" min="1" value={calories}
              onChange={(e) => setCalories(e.target.value)} />
          </div>
        </div>
        <p style={{ fontSize: 11, color: "var(--t3)", marginTop: -8, marginBottom: 14, lineHeight: 1.5 }}>
          ~{selected.rate} kcal/min estimate for {selected.name}. Adjust as needed.
        </p>

        {/* Step count */}
        <div style={{ background: "var(--card2)", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: "var(--t1)", fontWeight: 500, marginBottom: 8 }}>Phone step count</p>
          <div className="dual">
            <div>
              <label>Steps today</label>
              <input type="number" placeholder="e.g. 8420" value={steps}
                onChange={(e) => handleStepsChange(e.target.value)} />
            </div>
            <div>
              <label>Cal from steps</label>
              <input type="number" value={steps ? String(Math.round(parseInt(steps) * 0.04)) : ""}
                readOnly style={{ color: "var(--t2)" }} placeholder="auto" />
            </div>
          </div>
        </div>

        {/* Date + Notes */}
        <div className="dual">
          <div>
            <label>Date</label>
            <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
          </div>
          <div>
            <label>Notes (optional)</label>
            <input type="text" placeholder="e.g. Morning run" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <><span className="spinner" /> Saving…</> : "Save activity"}
        </button>
      </div>
    </div>
  );
}
