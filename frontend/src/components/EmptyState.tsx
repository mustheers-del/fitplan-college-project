// frontend/src/components/EmptyState.tsx
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message?: string;
  /** A single emoji or short glyph. Keep it simple. */
  icon?: string;
  /** Usually a <Button> that fixes the emptiness, e.g. "Generate a plan". */
  action?: ReactNode;
}

export function EmptyState({
  title,
  message,
  icon = "📭",
  action,
}: EmptyStateProps) {
  return (
    <div className="fp-empty">
      <div className="fp-empty__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="fp-empty__title">{title}</div>
      {message && <p className="fp-empty__message">{message}</p>}
      {action}
    </div>
  );
}
