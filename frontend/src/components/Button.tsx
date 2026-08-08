// frontend/src/components/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  /** Full width — use inside forms and on mobile. */
  block?: boolean;
  /** Shows "Please wait…" and disables the button. */
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [
    "fp-btn",
    `fp-btn--${variant}`,
    size !== "md" ? `fp-btn--${size}` : "",
    block ? "fp-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? "Please wait…" : children}
    </button>
  );
}
