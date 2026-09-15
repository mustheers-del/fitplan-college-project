import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--c-bg, #f8fafc)",
        color: "var(--c-text, #111827)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 6%",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 800 }}>
          FitPlan
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            to="/login"
            style={{
              padding: "10px 16px",
              textDecoration: "none",
              color: "#2563eb",
              fontWeight: 600,
            }}
          >
            Login
          </Link>

          <Link
            to="/signup"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        <section
          style={{
            padding: "90px 6%",
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#2563eb",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            AI-POWERED FITNESS & NUTRITION
          </p>

          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 68px)",
              lineHeight: 1.05,
              margin: "0 auto 24px",
            }}
          >
            Your personalized fitness plan, powered by AI.
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#6b7280",
              maxWidth: "680px",
              margin: "0 auto 32px",
            }}
          >
            FitPlan creates personalized workouts, nutrition plans, recipes,
            progress tracking, and AI coaching based on your goals and fitness
            profile.
          </p>

          <Link
            to="/signup"
            style={{
              display: "inline-block",
              padding: "14px 24px",
              borderRadius: "10px",
              textDecoration: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Start Your Fitness Journey
          </Link>
        </section>

        <section
          style={{
            padding: "30px 6% 80px",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                title: "AI Workouts",
                text: "Get workouts tailored to your goals, experience, equipment, and injuries.",
              },
              {
                title: "Smart Nutrition",
                text: "Plan your meals and generate recipes that fit your fitness goals.",
              },
              {
                title: "Track Progress",
                text: "Log your workouts, meals, and daily activity to understand your progress.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: "#ffffff",
                  padding: "28px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h2 style={{ marginTop: 0 }}>{feature.title}</h2>
                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer
        style={{
          padding: "24px 6%",
          textAlign: "center",
          borderTop: "1px solid #e5e7eb",
          color: "#6b7280",
          background: "#ffffff",
        }}
      >
        FitPlan — AI-Powered Fitness & Nutrition Planner
      </footer>
    </div>
  );
}
