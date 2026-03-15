interface DashboardCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

/** Reusable stat card for the dashboard grid. */
export default function DashboardCard({ label, value, unit, color }: DashboardCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>
        {value}
      </div>
      {unit && <div className="stat-unit">{unit}</div>}
    </div>
  );
}
