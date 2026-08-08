interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  delta?: number;
  deltaLabel?: string;
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
