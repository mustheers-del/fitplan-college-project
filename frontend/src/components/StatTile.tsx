// frontend/src/components/StatTile.tsx
interface StatTileProps {
  label: string;
  value: string | number;
  /** Unit or target shown beside the value, e.g. "/ 2,300 kcal". */
  unit?: string;
  /** Free-text line under the value. Ignored when `delta` is given. */
  hint?: string;
  /** Percentage change. The sign decides colour and arrow. */
  delta?: number;
  /** Context for the delta, e.g. "vs last week". */
  deltaLabel?: string;
  /** Forces the hint colour when you're not using `delta`. */
  trend?: "up" | "down";
}

export function StatTile({
  label,
  value,
  unit,
  hint,
  delta,
  deltaLabel,
  trend,
}: StatTileProps) {
  // A delta decides the direction; otherwise fall back to an explicit trend.
  const direction =
    delta === undefined
      ? trend
      : delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : undefined;

  const hintClass = [
    "fp-stat__hint",
    direction ? `fp-stat__hint--${direction}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const deltaText =
    delta === undefined
      ? null
      : `${delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} ${Math.abs(delta)}%` +
        (deltaLabel ? ` ${deltaLabel}` : "");

  const subline = deltaText ?? hint;

  return (
    <div className="fp-stat">
      <div className="fp-stat__label">{label}</div>
      <div className="fp-stat__value">
        {value}
        {unit && <span className="fp-stat__unit"> {unit}</span>}
      </div>
      {subline && <div className={hintClass}>{subline}</div>}
    </div>
  );
}

export default StatTile;
