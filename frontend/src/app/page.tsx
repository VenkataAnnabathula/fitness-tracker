"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getDashboard, getProfile, getProgress, DashboardOut, UserProfile, ProgressDayOut } from "@/lib/api";

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }
function fmtDate(s: string) { const d = new Date(s + "T00:00:00"); return `${d.getMonth()+1}/${d.getDate()}`; }

function calcGoal(p: UserProfile): number | null {
  if (!p.weight_kg || !p.height_cm || !p.age || !p.gender) return null;
  const base = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age;
  const bmr  = p.gender === "female" ? base - 161 : base + 5;
  const tdee = Math.round(bmr * (p.activity_level ?? 1.55));
  return p.goal === "lose" ? tdee - 500 : p.goal === "gain" ? tdee + 200 : tdee;
}

// Circular SVG ring — circumference ≈ 239
function CalRing({ calories, goal }: { calories: number; goal: number | null }) {
  const C = 239;
  const pct = goal ? Math.min(calories / goal, 1) : 0;
  const offset = C * (1 - pct);
  const over = goal ? calories > goal : false;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <svg width="94" height="94" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={over ? "#ff4757" : "#7b61ff"} />
            <stop offset="100%" stopColor={over ? "#ff6b7a" : "#00d4ff"} />
          </linearGradient>
        </defs>
        <circle cx="47" cy="47" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <circle cx="47" cy="47" r="38" fill="none" stroke="url(#ring-grad)" strokeWidth="7"
          strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 400, fontFamily: "var(--mono)", color: "var(--t1)", letterSpacing: -0.5 }}>
          {calories.toLocaleString()}
        </span>
        <span style={{ fontSize: 9, color: "var(--t3)", letterSpacing: "0.05em", marginTop: 1 }}>kcal in</span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, goal, gradient }: { label: string; value: number; goal: number; gradient: string }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div className="macro-bar">
      <div className="macro-bar-top">
        <span>{label}</span>
        <span className="macro-bar-val">{value}g / {goal}g</span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, background: gradient }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tab, setTab] = useState<"today" | "progress">("today");
  const [date, setDate] = useState(toISODate(new Date()));
  const [data, setData] = useState<DashboardOut | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ProgressDayOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getDashboard(date), getProfile(), getProgress(30)])
      .then(([dash, prof, prog]) => { setData(dash); setProfile(prof); setProgress(prog); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  const goal = profile ? calcGoal(profile) : null;
  const deficit = goal && data ? goal - data.net_calories : null;

  // Macro goals (rough estimates: protein 30%, carbs 40%, fat 30% of goal)
  const proteinGoal = goal ? Math.round(goal * 0.30 / 4) : 160;
  const carbsGoal   = goal ? Math.round(goal * 0.40 / 4) : 200;
  const fatGoal     = goal ? Math.round(goal * 0.30 / 9) : 65;

  // Progress chart data (only days with activity)
  const chartData = progress.filter(d => d.calories_in > 0 || d.weight_kg).map(d => ({ ...d, date: fmtDate(d.date) }));
  const wData = progress.filter(d => d.weight_kg).map(d => ({ date: fmtDate(d.date), weight: d.weight_kg }));

  const now = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dateLabel = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p className="page-subtitle">{dateLabel}</p>
          <h1 className="page-title">
            {profile?.name && profile.name !== "Me"
              ? `Good ${now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, ${profile.name}`
              : "Dashboard"}
          </h1>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "auto", fontSize: 13, padding: "7px 10px", marginTop: 8, borderRadius: 10, border: "1px solid var(--border2)", background: "var(--card2)", color: "var(--t1)" }}
        />
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        <button className={`dash-tab${tab === "today" ? " on" : ""}`} onClick={() => setTab("today")}>Today</button>
        <button className={`dash-tab${tab === "progress" ? " on" : ""}`} onClick={() => setTab("progress")}>Progress</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty" style={{ textAlign: "center", paddingTop: 40 }}>Loading…</div>
      ) : (

        /* ── TODAY TAB ── */
        tab === "today" ? (
          data ? (
            <>
              {/* Calorie ring + stats */}
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <CalRing calories={data.total_calories} goal={goal} />
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {[
                    { label: "Goal",   val: goal ? goal.toLocaleString() : "—", color: undefined },
                    { label: "Burned", val: data.calories_burned.toLocaleString(), color: undefined },
                    { label: "Net",    val: data.net_calories.toLocaleString(), color: undefined },
                    { label: "Deficit", val: deficit !== null ? Math.abs(Math.round(deficit)).toLocaleString() : "—", color: deficit !== null && deficit >= 0 ? "var(--green)" : "var(--red)" },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div style={{ fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 300, fontFamily: "var(--mono)", color: color || "var(--t1)" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrients */}
              <div className="card">
                <p className="section-title">Nutrients</p>
                <MacroBar label="Protein" value={data.total_protein} goal={proteinGoal} gradient="linear-gradient(90deg,#7b61ff,#00d4ff)" />
                <MacroBar label="Carbs"   value={data.total_carbs}   goal={carbsGoal}   gradient="linear-gradient(90deg,#00d4ff,#00ff87)" />
                <MacroBar label="Fat"     value={data.total_fats}    goal={fatGoal}     gradient="linear-gradient(90deg,#ff3cac,#7b61ff)" />
              </div>

              {/* Quick add */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Link href="/add-meal"     className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>+ Meal</Link>
                <Link href="/add-activity" className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>+ Activity</Link>
                <Link href="/add-weight"   className="btn btn-secondary" style={{ flex: 1, textAlign: "center" }}>+ Weight</Link>
              </div>

              {/* Meals */}
              <div className="card">
                <p className="section-title">Meals today</p>
                {data.meals.length === 0 ? <p className="empty">No meals logged.</p> : data.meals.map(meal => (
                  <div key={meal.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span className="tag">{meal.meal_type || "meal"}</span>
                      <span style={{ fontWeight: 400, fontSize: 13, fontFamily: "var(--mono)", color: "var(--t2)" }}>{meal.total_calories} kcal</span>
                    </div>
                    {meal.items.map(item => (
                      <div key={item.id} className="row">
                        <div>
                          <div className="row-name">{item.parsed_food_name}</div>
                          <div className="row-meta">{item.quantity} {item.unit}</div>
                        </div>
                        <div className="row-value">
                          {item.calories > 0 ? `${item.calories} kcal` : <span style={{ color: "var(--rgb1)", fontSize: 11 }}>estimated</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Activities */}
              <div className="card">
                <p className="section-title">Activity</p>
                {data.activities.length === 0 ? <p className="empty">No activities logged.</p> : data.activities.map(act => (
                  <div key={act.id} className="row">
                    <div>
                      <div className="row-name">{act.activity_type}</div>
                      <div className="row-meta">{act.duration_min} min</div>
                    </div>
                    <div className="row-value" style={{ color: "var(--green)" }}>−{act.calories_burned} kcal</div>
                  </div>
                ))}
              </div>

              {/* Weight */}
              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p className="section-title" style={{ marginBottom: 4 }}>Weight today</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                    <span style={{ fontSize: 30, fontWeight: 200, fontFamily: "var(--mono)", color: "var(--t1)", letterSpacing: -1 }}>
                      {data.weight_kg ?? "—"}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--t3)" }}>kg</span>
                  </div>
                </div>
                <Link href="/add-weight" className="btn btn-secondary" style={{ width: "auto" }}>Log</Link>
              </div>
            </>
          ) : null

        /* ── PROGRESS TAB ── */
        ) : (
          <>
            {/* Summary stats */}
            <div className="stat-grid">
              {[
                { label: "Avg Cal In",    val: progress.filter(d=>d.calories_in>0).length ? Math.round(progress.reduce((s,d)=>s+d.calories_in,0)/Math.max(progress.filter(d=>d.calories_in>0).length,1)).toLocaleString() : "—" },
                { label: "Avg Burned",    val: progress.filter(d=>d.calories_in>0).length ? Math.round(progress.reduce((s,d)=>s+d.calories_burned,0)/Math.max(progress.filter(d=>d.calories_in>0).length,1)).toLocaleString() : "—" },
                { label: "Avg Protein",   val: progress.filter(d=>d.calories_in>0).length ? Math.round(progress.reduce((s,d)=>s+d.protein,0)/Math.max(progress.filter(d=>d.calories_in>0).length,1))+"g" : "—" },
                { label: "Days logged",   val: progress.filter(d=>d.calories_in>0).length.toString() },
              ].map(({ label, val }) => (
                <div className="stat-card" key={label}>
                  <div className="stat-label">{label}</div>
                  <div className="stat-value">{val}</div>
                </div>
              ))}
            </div>

            {chartData.length === 0 ? (
              <div className="card"><p className="empty">No data yet — start logging meals!</p></div>
            ) : (
              <>
                <div className="card">
                  <p className="section-title">Calories in vs Burned (30d)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "var(--card2)", border: "1px solid var(--border2)", borderRadius: 10, color: "var(--t1)" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="calories_in"    name="Cal In"  fill="#7b61ff" radius={[3,3,0,0]} />
                      <Bar dataKey="calories_burned" name="Burned" fill="#00d4ff" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <p className="section-title">Protein Intake (30d)</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "var(--card2)", border: "1px solid var(--border2)", borderRadius: 10, color: "var(--t1)" }} />
                      <Line type="monotone" dataKey="protein" name="Protein (g)" stroke="#00ff87" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Weight trend */}
            <div className="card">
              <p className="section-title">Weight trend (30d)</p>
              {wData.length === 0 ? <p className="empty">No weight entries yet.</p> : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={wData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={["auto","auto"]} />
                    <Tooltip contentStyle={{ background: "var(--card2)", border: "1px solid var(--border2)", borderRadius: 10, color: "var(--t1)" }} />
                    <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#7b61ff" dot={{ r: 3, fill: "#7b61ff" }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
