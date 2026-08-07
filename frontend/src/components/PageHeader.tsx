// frontend/src/components/PageHeader.tsx
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Buttons or controls shown on the right, e.g. "Generate New Plan". */
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="fp-pageheader">
      <div>
        <h1 className="fp-pageheader__title">{title}</h1>
        {subtitle && <p className="fp-pageheader__subtitle">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}
