'use client';
import { useEffect, useState } from 'react';
import { getDashboard, type DashboardData } from '@/lib/api';

const TODAY = new Date().toISOString().split('T')[0];

function Ring({ pct, color, size = 88 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 1));
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)' }}/>
    </svg>
  );
}

function MacroBar({ label, g, goal, color }: { label: string; g: number; goal: number; color: string }) {
  const pct = Math.min((g / goal) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--mono)' }}>{g}g</span>
      </div>
      <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.7s ease' }}/>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard(TODAY).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const calIn = data?.total_calories_in ?? 0;
  const calGoal = data?.calorie_goal ?? 2000;
  const calBurned = data?.total_calories_burned ?? 0;
  const calNet = calIn - calBurned;
  const calPct = calIn / calGoal;

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[120, 80, 200, 160].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.4s ease infinite', animationDelay: `${i * 0.1}s` }}/>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: '1.25rem 1rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>{dateLabel}</p>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>{greeting}</h1>
      </div>

      {/* Calorie hero card */}
      <div className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Ring pct={calPct} color={calPct > 1 ? 'var(--danger)' : 'var(--accent)'} size={88}/>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 500 }}>{calIn}</span>
            <span style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.05em' }}>kcal</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'Goal', val: calGoal },
              { label: 'Burned', val: calBurned },
              { label: 'Net', val: calNet },
              { label: 'Remaining', val: Math.max(0, calGoal - calNet) },
            ].map(({ label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--mono)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="card" style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, color: 'var(--text-2)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Macros</p>
        <MacroBar label="Protein" g={data?.total_protein ?? 0} goal={160} color="#2d6a4f"/>
        <MacroBar label="Carbs"   g={data?.total_carbs   ?? 0} goal={250} color="#d4a017"/>
        <MacroBar label="Fat"     g={data?.total_fats    ?? 0} goal={65}  color="#e07c3a"/>
      </div>

      {/* Today's meals */}
      <div className="card" style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, color: 'var(--text-2)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Today's meals</p>
        {(!data?.meals || data.meals.length === 0) ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>No meals logged yet</p>
        ) : data.meals.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{m.meal_type}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>{m.items?.length ?? 0} items</span>
            </div>
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>{m.total_calories} kcal</span>
          </div>
        ))}
      </div>

      {/* Today's activity */}
      <div className="card" style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 12, color: 'var(--text-2)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Activity</p>
        {(!data?.activities || data.activities.length === 0) ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>No activity logged yet</p>
        ) : data.activities.map((a) => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{a.activity_type}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>{a.duration_min} min</span>
            </div>
            <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>−{a.calories_burned} kcal</span>
          </div>
        ))}
      </div>

      {/* Weight */}
      {data?.weight_today && (
        <div className="card" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Today's weight</span>
          <span style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--mono)' }}>{data.weight_today} <span style={{ fontSize: 12, color: 'var(--text-3)' }}>kg</span></span>
        </div>
      )}
    </div>
  );
}
