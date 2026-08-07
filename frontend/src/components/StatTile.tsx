// frontend/src/components/StatTile.tsx
interface StatTileProps {
  label: string;
  value: string | number;
  /** Small line under the value, e.g. "+2.4 kg this month". */
  hint?: string;
  /** Colours the hint green or red. Leave off for neutral grey. */
  trend?: "up" | "down";
}

export function StatTile({ label, value, hint, trend }: StatTileProps) {
  const hintClass = ["fp-stat__hint", trend ? `fp-stat__hint--${trend}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="fp-stat">
      <div className="fp-stat__label">{label}</div>
      <div className="fp-stat__value">{value}</div>
      {hint && <div className={hintClass}>{hint}</div>}
    </div>
  );
}
