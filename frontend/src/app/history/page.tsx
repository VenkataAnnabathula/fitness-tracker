"use client";

import { useEffect, useState } from "react";
import { getWeightHistory, getActivityHistory, WeightLogOut, ActivityLogOut } from "@/lib/api";

type Tab = "weight" | "activity";

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>("weight");
  const [weightHistory, setWeightHistory] = useState<WeightLogOut[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityLogOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getWeightHistory(), getActivityHistory()])
      .then(([w, a]) => {
        setWeightHistory(w);
        setActivityHistory(a);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">Last 30 entries</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Tab switcher */}
      <div className="tab-bar">
        <button
          className={`btn ${tab === "weight" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("weight")}
        >
          ⚖️ Weight
        </button>
        <button
          className={`btn ${tab === "activity" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("activity")}
        >
          🏃 Activity
        </button>
      </div>

      {loading ? (
        <div className="empty" style={{ textAlign: "center", paddingTop: "40px" }}>Loading…</div>
      ) : (
        <div className="card">
          {/* Weight history */}
          {tab === "weight" && (
            <>
              <div className="section-title">Weight History</div>
              {weightHistory.length === 0 ? (
                <p className="empty">No weight entries yet. Log your first weigh-in!</p>
              ) : (
                weightHistory.map((entry) => (
                  <div key={entry.id} className="row">
                    <span className="row-name">{entry.log_date}</span>
                    <span className="row-value">{entry.weight_kg} kg</span>
                  </div>
                ))
              )}
            </>
          )}

          {/* Activity history */}
          {tab === "activity" && (
            <>
              <div className="section-title">Activity History</div>
              {activityHistory.length === 0 ? (
                <p className="empty">No activities yet. Start moving!</p>
              ) : (
                activityHistory.map((entry) => (
                  <div key={entry.id} className="row">
                    <div>
                      <div className="row-name">{entry.activity_type}</div>
                      <div className="row-meta">{entry.log_date} · {entry.duration_min} min</div>
                    </div>
                    <div className="row-value">−{entry.calories_burned} kcal</div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
