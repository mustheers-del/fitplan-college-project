// frontend/src/components/Card.tsx
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Optional heading rendered at the top of the card. */
  title?: string;
  /** Remove the internal padding — use when the card holds a full-width table or list. */
  flush?: boolean;
  /** Stronger shadow, for cards that should sit above the page. */
  raised?: boolean;
  className?: string;
}

export function Card({
  children,
  title,
  flush,
  raised,
  className = "",
}: CardProps) {
  const classes = [
    "fp-card",
    flush ? "fp-card--flush" : "",
    raised ? "fp-card--raised" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {title && <h3 className="fp-card__title">{title}</h3>}
      {children}
    </div>
  );
}

export default Card;
