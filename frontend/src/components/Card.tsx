import type { ReactNode } from "react";

/** OWNER: [D]. The base surface for every panel in the mockup. */
export default function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-lg)",
        padding: "var(--sp-5)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--sp-4)",
          }}
        >
          {title && (
            <h3 style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-semibold)" }}>
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
