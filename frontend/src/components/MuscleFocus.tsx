import { useMemo, useState } from "react";

type Muscle =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "core"
  | "glutes"
  | "quadriceps"
  | "hamstrings"
  | "calves";

interface MuscleFocusProps {
  muscles: Muscle[];
}

const LABELS: Record<Muscle, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
  glutes: "Glutes",
  quadriceps: "Quadriceps",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

function muscleFill(active: boolean) {
  return active ? "var(--c-primary)" : "var(--c-border)";
}

export default function MuscleFocus({ muscles }: MuscleFocusProps) {
  const [view, setView] = useState<"front" | "back">("front");

  const activeMuscles = useMemo(
    () => new Set(muscles),
    [muscles]
  );

  const isActive = (muscle: Muscle) => activeMuscles.has(muscle);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "var(--sp-2)",
          marginBottom: "var(--sp-4)",
        }}
      >
        <button
          type="button"
          onClick={() => setView("front")}
          style={{
            padding: "var(--sp-2) var(--sp-3)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--c-border)",
            background:
              view === "front" ? "var(--c-primary)" : "var(--c-surface)",
            color: view === "front" ? "#fff" : "var(--c-text)",
            cursor: "pointer",
          }}
        >
          Front
        </button>

        <button
          type="button"
          onClick={() => setView("back")}
          style={{
            padding: "var(--sp-2) var(--sp-3)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--c-border)",
            background:
              view === "back" ? "var(--c-primary)" : "var(--c-surface)",
            color: view === "back" ? "#fff" : "var(--c-text)",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <svg
          viewBox="0 0 240 520"
          width="240"
          height="520"
          role="img"
          aria-label={`${view} body muscle focus diagram`}
        >
          {/* Head */}
          <circle
            cx="120"
            cy="42"
            r="25"
            fill="var(--c-surface)"
            stroke="var(--c-border)"
            strokeWidth="2"
          />

          {view === "front" ? (
            <>
              {/* Shoulders */}
              <ellipse
                cx="87"
                cy="105"
                rx="25"
                ry="18"
                fill={muscleFill(isActive("shoulders"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <ellipse
                cx="153"
                cy="105"
                rx="25"
                ry="18"
                fill={muscleFill(isActive("shoulders"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Chest */}
              <path
                d="M92 112 Q120 100 148 112 L143 155 Q120 166 97 155 Z"
                fill={muscleFill(isActive("chest"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Biceps */}
              <ellipse
                cx="70"
                cy="145"
                rx="12"
                ry="28"
                fill={muscleFill(isActive("biceps"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <ellipse
                cx="170"
                cy="145"
                rx="12"
                ry="28"
                fill={muscleFill(isActive("biceps"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Triceps - represented on outer upper arm */}
              <ellipse
                cx="57"
                cy="145"
                rx="7"
                ry="25"
                fill={muscleFill(isActive("triceps"))}
                opacity="0.75"
              />
              <ellipse
                cx="183"
                cy="145"
                rx="7"
                ry="25"
                fill={muscleFill(isActive("triceps"))}
                opacity="0.75"
              />

              {/* Core */}
              <rect
                x="99"
                y="160"
                width="42"
                height="82"
                rx="14"
                fill={muscleFill(isActive("core"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Quadriceps */}
              <path
                d="M99 240 Q108 230 118 240 L116 330 Q105 344 95 326 Z"
                fill={muscleFill(isActive("quadriceps"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <path
                d="M141 240 Q132 230 122 240 L124 330 Q135 344 145 326 Z"
                fill={muscleFill(isActive("quadriceps"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Calves */}
              <path
                d="M96 375 Q108 365 117 375 L113 445 Q103 458 94 442 Z"
                fill={muscleFill(isActive("calves"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <path
                d="M144 375 Q132 365 123 375 L127 445 Q137 458 146 442 Z"
                fill={muscleFill(isActive("calves"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
            </>
          ) : (
            <>
              {/* Back shoulders */}
              <ellipse
                cx="87"
                cy="105"
                rx="25"
                ry="18"
                fill={muscleFill(isActive("shoulders"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <ellipse
                cx="153"
                cy="105"
                rx="25"
                ry="18"
                fill={muscleFill(isActive("shoulders"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Back */}
              <path
                d="M91 112 Q120 98 149 112 L145 190 Q120 207 95 190 Z"
                fill={muscleFill(isActive("back"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Triceps */}
              <ellipse
                cx="68"
                cy="145"
                rx="12"
                ry="29"
                fill={muscleFill(isActive("triceps"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <ellipse
                cx="172"
                cy="145"
                rx="12"
                ry="29"
                fill={muscleFill(isActive("triceps"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Lower back / core area */}
              <rect
                x="99"
                y="190"
                width="42"
                height="52"
                rx="12"
                fill={muscleFill(isActive("core"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Glutes */}
              <ellipse
                cx="106"
                cy="260"
                rx="23"
                ry="27"
                fill={muscleFill(isActive("glutes"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <ellipse
                cx="134"
                cy="260"
                rx="23"
                ry="27"
                fill={muscleFill(isActive("glutes"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Hamstrings */}
              <path
                d="M96 282 Q108 275 118 285 L116 350 Q105 365 95 347 Z"
                fill={muscleFill(isActive("hamstrings"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <path
                d="M144 282 Q132 275 122 285 L124 350 Q135 365 145 347 Z"
                fill={muscleFill(isActive("hamstrings"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />

              {/* Calves */}
              <path
                d="M96 375 Q108 365 117 375 L113 445 Q103 458 94 442 Z"
                fill={muscleFill(isActive("calves"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
              <path
                d="M144 375 Q132 365 123 375 L127 445 Q137 458 146 442 Z"
                fill={muscleFill(isActive("calves"))}
                stroke="var(--c-surface)"
                strokeWidth="2"
              />
            </>
          )}

          {/* Simple body outline */}
          <path
            d="M95 82
               Q75 90 58 112
               L45 185
               Q43 198 52 201
               Q59 202 63 190
               L75 153
               L82 205
               L91 240
               L94 350
               L88 450
               Q87 466 99 468
               Q110 469 113 452
               L120 365
               L127 452
               Q130 469 141 468
               Q153 466 152 450
               L146 350
               L149 240
               L158 205
               L165 153
               L177 190
               Q181 202 188 201
               Q197 198 195 185
               L182 112
               Q165 90 145 82
               Z"
            fill="none"
            stroke="var(--c-border)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "var(--sp-2)",
          marginTop: "var(--sp-3)",
        }}
      >
        {muscles.length === 0 ? (
          <span style={{ color: "var(--c-text-secondary)" }}>
            No muscle targets available yet.
          </span>
        ) : (
          Array.from(new Set(muscles)).map((muscle) => (
            <span
              key={muscle}
              style={{
                padding: "var(--sp-1) var(--sp-2)",
                borderRadius: "999px",
                background: "var(--c-primary)",
                color: "#fff",
                fontSize: "var(--fs-sm)",
              }}
            >
              {LABELS[muscle]}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
