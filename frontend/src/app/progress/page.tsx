"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getProgress, ProgressDayOut } from "@/lib/api";

type Range = 7 | 14 | 30;

function fmt(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ProgressPage() {
  const [days, setDays] = useState<Range>(30);
  const [data, setData] = useState<ProgressDayOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getProgress(days)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  // Only show days that have any data for charts (weight chart shows all)
  const activeDays = data.filter((d) => d.calories_in > 0 || d.calories_burned > 0 || d.weight_kg);
  const weightDays = data.filter((d) => d.weight_kg);

  // Summary stats over range
  const loggedDays = data.filter((d) => d.calories_in > 0).length;
  const avgCalIn = loggedDays ? Math.round(data.reduce((s, d) => s + d.calories_in, 0) / Math.max(loggedDays, 1)) : 0;
  const avgBurned = loggedDays ? Math.round(data.reduce((s, d) => s + d.calories_burned, 0) / Math.max(loggedDays, 1)) : 0;
  const avgProtein = loggedDays ? Math.round(data.reduce((s, d) => s + d.protein, 0) / Math.max(loggedDays, 1)) : 0;
  const totalDeficit = Math.round(data.reduce((s, d) => s + (d.calories_burned - d.calories_in), 0));

  const chartData = activeDays.map((d) => ({ ...d, date: fmt(d.date) }));
  const wData = weightDays.map((d) => ({ date: fmt(d.date), weight: d.weight_kg }));

  return (
    <div className="container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Trends over time</p>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {([7, 14, 30] as Range[]).map((r) => (
            <button
              key={r}
              className={`btn ${days === r ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "6px 12px", fontSize: 13 }}
              onClick={() => setDays(r)}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="empty" style={{ textAlign: "center", paddingTop: 40 }}>Loading…</div>
      ) : (
        <>
          {/* ── Summary stats ── */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{avgCalIn}</div>
              <div className="stat-label">Avg Cal In</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgBurned}</div>
              <div className="stat-label">Avg Burned</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: totalDeficit >= 0 ? "#16a34a" : "#dc2626" }}>
                {totalDeficit >= 0 ? `-${totalDeficit}` : `+${Math.abs(totalDeficit)}`}
              </div>
              <div className="stat-label">Total Deficit</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgProtein}g</div>
              <div className="stat-label">Avg Protein</div>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="card">
              <p className="empty">No data yet — start logging meals and activities!</p>
            </div>
          ) : (
            <>
              {/* ── Calories chart ── */}
              <div className="card">
                <div className="section-title">Calories: In vs Burned</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="calories_in"   name="Cal In"    fill="#6366f1" radius={[3,3,0,0]} />
                    <Bar dataKey="calories_burned" name="Burned"  fill="#f97316" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ── Net calories chart ── */}
              <div className="card">
                <div className="section-title">Net Calories (In − Burned)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="net_calories" name="Net Cal" stroke="#6366f1" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ── Protein chart ── */}
              <div className="card">
                <div className="section-title">Protein Intake (g)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="protein" name="Protein (g)" stroke="#16a34a" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ── Macros breakdown ── */}
              <div className="card">
                <div className="section-title">Macros Breakdown</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="protein" name="Protein" stroke="#16a34a" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="carbs"   name="Carbs"   stroke="#f59e0b" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="fats"    name="Fats"    stroke="#f97316" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── Weight trend ── */}
          <div className="card">
            <div className="section-title">Weight Trend (kg)</div>
            {wData.length === 0 ? (
              <p className="empty">No weight entries in this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={wData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#6366f1" dot={{ r: 3 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
