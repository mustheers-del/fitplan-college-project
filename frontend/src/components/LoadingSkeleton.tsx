// frontend/src/components/LoadingSkeleton.tsx
interface LoadingSkeletonProps {
  /** How many grey bars to show. */
  lines?: number;
  /** Height of each bar. */
  height?: number;
  /** Width of each bar — any CSS width. */
  width?: string;
}

export function LoadingSkeleton({
  lines = 3,
  height = 16,
  width = "100%",
}: LoadingSkeletonProps) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="fp-skeleton"
          style={{
            height,
            // Last bar slightly shorter — reads as text rather than blocks.
            width: i === lines - 1 ? "60%" : width,
          }}
        />
      ))}
    </div>
  );
}
