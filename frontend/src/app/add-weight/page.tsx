"use client";

import { useState } from "react";
import Link from "next/link";
import { logWeight } from "@/lib/api";

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

export default function AddWeightPage() {
  const [logDate, setLogDate] = useState(toISODate(new Date()));
  const [weight, setWeight] = useState("72.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const adjust = (delta: number) => {
    setWeight((prev) => String(Math.round((parseFloat(prev || "0") + delta) * 10) / 10));
  };

  const handleSave = async () => {
    const kg = parseFloat(weight);
    if (!kg || kg < 20 || kg > 350) { setError("Enter a valid weight (20–350 kg)."); return; }
    setLoading(true); setError("");
    try {
      await logWeight(logDate, kg);
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save weight");
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
                <defs><linearGradient id="chk2"><stop offset="0%" stopColor="#7b61ff"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient></defs>
                <polyline points="3,10 8,15 17,5" stroke="url(#chk2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">Weight saved</h2>
            <p className="success-sub">{weight} kg on {logDate}</p>
            <div className="btn-row">
              <button className="btn btn-outline" onClick={() => setSaved(false)}>Edit</button>
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
        <p className="page-subtitle">Daily check-in</p>
        <h1 className="page-title">Log weight</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card" style={{ textAlign: "center", padding: "28px 18px" }}>
        <label style={{ display: "block", marginBottom: 14 }}>Weight in kg</label>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <input
            type="number"
            step="0.1"
            min="20"
            max="350"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="wt-big-input"
          />
          <span style={{ fontSize: 18, color: "var(--t3)", fontWeight: 300 }}>kg</span>
        </div>
        <div className="adj-row">
          {[-0.5, -0.1, 0.1, 0.5].map((d) => (
            <button key={d} className="adj-btn" onClick={() => adjust(d)}>
              {d > 0 ? "+" : ""}{d}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label>Date</label>
        <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <><span className="spinner" /> Saving…</> : "Save weight"}
        </button>
      </div>
    </div>
  );
}
