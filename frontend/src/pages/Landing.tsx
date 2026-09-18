import { Link } from "react-router-dom";
import "./Landing.css";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9v6M3.5 10.5v3M18 9v6M20.5 10.5v3M6 12h12" />
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v8M4.5 3v5.5a2.5 2.5 0 0 0 5 0V3M7 11v10" />
      <path d="M15 3v18M15 3c3 1 4.5 3.2 4.5 6S18 14 15 14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 20 6v5.5c0 4.7-3.2 7.9-8 9.5-4.8-1.6-8-4.8-8-9.5V6l8-3Z" />
      <path d="m8.5 12 2.3 2.3 4.7-5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 3-4 3 2 5-7" />
    </svg>
  );
}

function UserIllustration() {
  return (
    <svg
      className="hero-person"
      viewBox="0 0 420 420"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="210" cy="210" r="165" fill="#EEF5FF" />
      <circle cx="210" cy="105" r="42" fill="#D8E8FF" />
      <path d="M137 350c5-79 27-128 73-128s68 49 73 128" fill="#2563EB" />
      <path d="M156 350c3-61 14-99 54-99s51 38 54 99" fill="#1D4ED8" />
      <path
        d="M169 218c-13 18-22 39-28 65M251 218c13 18 22 39 28 65"
        stroke="#D8E8FF"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M177 105c0-25 15-45 35-45s35 20 35 45"
        stroke="#1E3A8A"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="194" cy="104" r="4" fill="#1E3A8A" />
      <circle cx="226" cy="104" r="4" fill="#1E3A8A" />
      <path
        d="M198 122c8 7 16 7 24 0"
        stroke="#1E3A8A"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="preview-top">
        <div>
          <span className="preview-eyebrow">YOUR WEEK</span>
          <h3>Personalized plan</h3>
        </div>
        <div className="preview-avatar">M</div>
      </div>

      <div className="preview-progress">
        <div className="progress-copy">
          <span>Weekly progress</span>
          <strong>78%</strong>
        </div>
        <div className="progress-track">
          <span />
        </div>
      </div>

      <div className="preview-grid">
        <div className="preview-card">
          <div className="preview-icon blue">
            <DumbbellIcon />
          </div>
          <span>Workout</span>
          <strong>Upper Body</strong>
          <small>45 min · Today</small>
        </div>

        <div className="preview-card">
          <div className="preview-icon green">
            <NutritionIcon />
          </div>
          <span>Nutrition</span>
          <strong>2,180 kcal</strong>
          <small>Balanced plan</small>
        </div>
      </div>

      <div className="preview-ai">
        <div className="ai-icon">
          <SparkIcon />
        </div>
        <div>
          <strong>FitPlan AI</strong>
          <span>Your plan adapts to your progress.</span>
        </div>
        <ArrowIcon />
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="fitplan-landing">
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <SparkIcon />
          </span>
          <span>FitPlan</span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#safety">Safety</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Log in
          </Link>
          <Link to="/signup" className="nav-signup">
            Get started
            <ArrowIcon />
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            AI-powered fitness planning
          </div>

          <h1>
            Your fitness journey,
            <span> intelligently planned.</span>
          </h1>

          <p className="hero-description">
            FitPlan creates personalized workout and nutrition plans that adapt
            to your goals, progress, preferences, and safety needs.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="primary-button">
              Build my plan
              <ArrowIcon />
            </Link>

            <a href="#how-it-works" className="secondary-button">
              See how it works
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-check">
                <CheckIcon />
              </span>
              Personalized plans
            </div>

            <div className="trust-item">
              <span className="trust-check">
                <CheckIcon />
              </span>
              Injury-aware guidance
            </div>

            <div className="trust-item">
              <span className="trust-check">
                <CheckIcon />
              </span>
              Progress tracking
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-glow" />

          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />

          <div className="person-wrapper">
            <UserIllustration />
          </div>

          <div className="floating-stat stat-workout">
            <div className="floating-icon blue">
              <DumbbellIcon />
            </div>
            <div>
              <span>Today's workout</span>
              <strong>Upper Body</strong>
            </div>
            <span className="status-dot" />
          </div>

          <div className="floating-stat stat-progress">
            <div className="mini-chart">
              <ChartIcon />
            </div>
            <div>
              <span>Weekly progress</span>
              <strong>78%</strong>
            </div>
          </div>

          <div className="floating-stat stat-ai">
            <div className="floating-icon purple">
              <SparkIcon />
            </div>
            <div>
              <span>FitPlan AI</span>
              <strong>Plan updated</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading centered">
          <span className="section-label">YOUR FITNESS, IN ONE PLACE</span>
          <h2>
            Everything you need to
            <span> stay consistent.</span>
          </h2>
          <p>
            From your first workout to your weekly progress, FitPlan brings your
            fitness journey into one simple experience.
          </p>
        </div>

        <DashboardPreview />
      </section>

      <section id="features" className="features-section">
        <div className="section-heading">
          <span className="section-label">BUILT AROUND YOU</span>
          <h2>
            More than a workout plan.
            <span> A complete fitness system.</span>
          </h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card feature-card-main">
            <div className="feature-icon blue">
              <SparkIcon />
            </div>
            <span className="feature-number">01</span>
            <h3>AI-Personalized Plans</h3>
            <p>
              Get weekly workout and nutrition recommendations built around your
              profile, goals, preferences, and progress.
            </p>

            <div className="feature-visual plan-visual">
              <div className="plan-line short" />
              <div className="plan-line" />
              <div className="plan-line medium" />
              <div className="plan-pill">AI optimized</div>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-icon green">
              <NutritionIcon />
            </div>
            <span className="feature-number">02</span>
            <h3>Smarter Nutrition</h3>
            <p>
              Track meals and get practical nutrition guidance that fits your
              fitness goals.
            </p>

            <div className="nutrition-bars">
              <div>
                <span>Protein</span>
                <i>
                  <b style={{ width: "78%" }} />
                </i>
              </div>
              <div>
                <span>Carbs</span>
                <i>
                  <b style={{ width: "61%" }} />
                </i>
              </div>
              <div>
                <span>Fats</span>
                <i>
                  <b style={{ width: "48%" }} />
                </i>
              </div>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-icon purple">
              <ChartIcon />
            </div>
            <span className="feature-number">03</span>
            <h3>Progress That Matters</h3>
            <p>
              Log your workouts and meals, then understand your consistency
              through simple progress insights.
            </p>

            <div className="mini-progress-chart">
              <div className="chart-bars">
                <span style={{ height: "34%" }} />
                <span style={{ height: "48%" }} />
                <span style={{ height: "42%" }} />
                <span style={{ height: "67%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "82%" }} />
                <span style={{ height: "76%" }} />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="steps-section">
        <div className="steps-copy">
          <span className="section-label">HOW IT WORKS</span>
          <h2>
            Start simple.
            <span> Build momentum.</span>
          </h2>
          <p>
            FitPlan turns your information into a structured fitness journey
            without making the process complicated.
          </p>

          <Link to="/signup" className="text-button">
            Create your plan
            <ArrowIcon />
          </Link>
        </div>

        <div className="steps-list">
          <div className="step-item">
            <span className="step-number">01</span>
            <div>
              <h3>Tell us about yourself</h3>
              <p>
                Set your goals, experience, preferences, and relevant
                limitations.
              </p>
            </div>
          </div>

          <div className="step-item">
            <span className="step-number">02</span>
            <div>
              <h3>Get your personalized plan</h3>
              <p>
                FitPlan generates a structured workout and nutrition plan
                tailored to your profile.
              </p>
            </div>
          </div>

          <div className="step-item">
            <span className="step-number">03</span>
            <div>
              <h3>Log and improve</h3>
              <p>
                Track your daily activity and use your progress to stay
                consistent over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="safety" className="safety-section">
        <div className="safety-visual">
          <div className="safety-circle">
            <ShieldIcon />
          </div>

          <div className="safety-ring ring-one" />
          <div className="safety-ring ring-two" />

          <div className="safety-chip chip-top">
            <CheckIcon />
            Profile-aware
          </div>

          <div className="safety-chip chip-bottom">
            <CheckIcon />
            Injury-aware
          </div>
        </div>

        <div className="safety-copy">
          <span className="section-label">DESIGNED WITH SAFETY IN MIND</span>

          <h2>
            Your limitations are part of
            <span> your plan.</span>
          </h2>

          <p>
            FitPlan considers injury information provided in your profile when
            generating workouts. Safety rules help identify exercises that
            should be avoided for supported injury types.
          </p>

          <div className="safety-points">
            <div>
              <span>
                <CheckIcon />
              </span>
              Injury information carried into planning
            </div>

            <div>
              <span>
                <CheckIcon />
              </span>
              Exercise restrictions checked during generation
            </div>

            <div>
              <span>
                <CheckIcon />
              </span>
              AI output validated before delivery
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-glow" />

        <div className="cta-content">
          <div className="cta-icon">
            <SparkIcon />
          </div>

          <span className="section-label light">READY WHEN YOU ARE</span>

          <h2>
            Build a fitness routine
            <span> that fits your life.</span>
          </h2>

          <p>
            Start with your goals. Let FitPlan help turn them into a structured
            plan you can actually follow.
          </p>

          <Link to="/signup" className="cta-button">
            Get started with FitPlan
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="brand-mark">
            <SparkIcon />
          </span>
          <div>
            <strong>FitPlan</strong>
            <span>AI-powered fitness planning</span>
          </div>
        </div>

        <div className="footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Get started</Link>
        </div>

        <p>© {new Date().getFullYear()} FitPlan. Built for smarter fitness.</p>
      </footer>
    </main>
  );
}