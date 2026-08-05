/** The four tiles across the top of the mockup dashboard. OWNER: [D] */
export default function StatTile({
  label,
  value,
  unit,
  delta,
  deltaLabel = "vs yesterday",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-lg)",
        padding: "var(--sp-4)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-text-secondary)" }}>{label}</div>
      <div
        style={{
          fontSize: "var(--fs-2xl)",
          fontWeight: "var(--fw-bold)",
          margin: "var(--sp-1) 0",
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: "var(--fs-sm)",
              fontWeight: "var(--fw-normal)",
              color: "var(--c-text-muted)",
            }}
          >
            {" "}
            {unit}
          </span>
        )}
      </div>
      {delta !== undefined && (
        <div
          style={{
            fontSize: "var(--fs-xs)",
            color: up ? "var(--c-success)" : "var(--c-danger)",
          }}
        >
          {up ? "↑" : "↓"} {Math.abs(delta)}% <span style={{ color: "var(--c-text-muted)" }}>{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
