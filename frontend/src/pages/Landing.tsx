import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
} from "lucide-react";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing-page">
      {/* ==================== NAVBAR ==================== */}
      <header className="landing-nav">
        <div className="landing-container nav-inner">
          <Link to="/" className="brand" aria-label="FitPlan home">
            <span className="brand-mark">F</span>
            <span>FitPlan</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#safety">Safety</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">
              Log in
            </Link>

            <Link to="/signup" className="nav-cta">
              Get started
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ==================== HERO ==================== */}
        <section className="hero-section">
          <div className="landing-container hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={15} aria-hidden="true" />
                <span>AI-powered fitness planning</span>
              </div>

              <h1 className="hero-title">
                <span>Your fitness journey,</span>
                <span className="hero-gradient-text">
                  intelligently planned.
                </span>
              </h1>

              <p className="hero-description">
                Personalized workout and nutrition plans that adapt to your
                goals, progress, preferences, and safety needs.
              </p>

              <div className="hero-actions">
                <Link to="/signup" className="primary-button">
                  Get started
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>

                <a href="#how-it-works" className="secondary-button">
                  See how it works
                </a>
              </div>

              <div className="hero-trust">
                <div>
                  <Check size={15} aria-hidden="true" />
                  <span>Personalized plans</span>
                </div>

                <div>
                  <Check size={15} aria-hidden="true" />
                  <span>Injury-aware</span>
                </div>

                <div>
                  <Check size={15} aria-hidden="true" />
                  <span>Progress tracking</span>
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="hero-visual">
              <div className="hero-glow" aria-hidden="true" />

              <div className="hero-image-wrap">
                <img
                  src="/fitness-hero.jpg"
                  alt="Athletic person training with dumbbells"
                  className="hero-image"
                />

                <div className="image-overlay" aria-hidden="true" />
              </div>

              {/* Workout Card */}
              <div className="floating-card workout-card">
                <div className="floating-icon blue-icon">
                  <Dumbbell size={19} aria-hidden="true" />
                </div>

                <div>
                  <span className="floating-label">Today's workout</span>
                  <strong>Upper Body</strong>
                  <small>45 min · Today</small>
                </div>
              </div>

              {/* Progress Card */}
              <div className="floating-card progress-card">
                <div className="progress-top">
                  <span>Goal progress</span>
                  <strong>78%</strong>
                </div>

                <div className="progress-bar" aria-hidden="true">
                  <span />
                </div>

                <small>Keep going — you're on track.</small>
              </div>

              {/* AI Card */}
              <div className="floating-card ai-card">
                <div className="floating-icon green-icon">
                  <Sparkles size={18} aria-hidden="true" />
                </div>

                <div>
                  <span className="floating-label">FitPlan AI</span>
                  <strong>Plan updated</strong>
                  <small>Based on your progress</small>
                </div>
              </div>

              {/* Calories Card */}
              <div className="floating-card calories-card">
                <div className="calories-icon">
                  <HeartPulse size={17} aria-hidden="true" />
                </div>

                <div>
                  <span className="floating-label">Active calories</span>
                  <strong>1,980 kcal</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURES ==================== */}
        <section className="features-section" id="features">
          <div className="landing-container">
            <div className="section-heading compact-heading">
              <span className="section-kicker">FITPLAN</span>

              <h2>Everything you need to stay consistent.</h2>

              <p>
                One simple place for your workouts, nutrition, and progress.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon blue-feature">
                  <Target size={21} aria-hidden="true" />
                </div>

                <div>
                  <span className="feature-number">01</span>
                  <h3>Personalized workouts</h3>
                  <p>
                    Plans built around your goals, experience, preferences, and
                    progress.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon orange-feature">
                  <Utensils size={21} aria-hidden="true" />
                </div>

                <div>
                  <span className="feature-number">02</span>
                  <h3>Smarter nutrition</h3>
                  <p>
                    Practical nutrition guidance designed around your fitness
                    goals.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon green-feature">
                  <TrendingUp size={21} aria-hidden="true" />
                </div>

                <div>
                  <span className="feature-number">03</span>
                  <h3>Progress tracking</h3>
                  <p>
                    Log your activity and understand your consistency over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section className="steps-section" id="how-it-works">
          <div className="landing-container">
            <div className="section-heading">
              <span className="section-kicker">HOW IT WORKS</span>

              <h2>Start simple. Build momentum.</h2>

              <p>
                FitPlan turns your information into a structured fitness journey
                in three simple steps.
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">01</span>

                <h3>Tell us about yourself</h3>

                <p>
                  Set your goals, experience, preferences, and relevant
                  limitations.
                </p>
              </div>

              <div className="step-connector" aria-hidden="true">
                <ChevronRight size={20} />
              </div>

              <div className="step-card">
                <span className="step-number">02</span>

                <h3>Get your personalized plan</h3>

                <p>
                  Receive daily fitness routines and meal guidance tailored
                  directly to your life.
                </p>
              </div>

              <div className="step-connector" aria-hidden="true">
                <ChevronRight size={20} />
              </div>

              <div className="step-card">
                <span className="step-number">03</span>

                <h3>Track and adapt</h3>

                <p>
                  Log your workouts as FitPlan automatically adjusts your path
                  over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SAFETY ==================== */}
        <section className="safety-section" id="safety">
          <div className="landing-container">
            <div className="safety-card">
              <div className="safety-content">
                <span className="section-kicker">SAFETY FIRST</span>

                <h2>Built for intelligent, safe progression.</h2>

                <p>
                  Train smarter without overtraining or injury. FitPlan
                  incorporates safe pacing into every customized program.
                </p>
              </div>

              <div className="safety-points">
                <div>
                  <span>
                    <Check size={14} aria-hidden="true" />
                  </span>
                  <p>Smart exercise swaps for joint discomfort</p>
                </div>

                <div>
                  <span>
                    <Check size={14} aria-hidden="true" />
                  </span>
                  <p>Automated recovery weeks and rest indicators</p>
                </div>

                <div>
                  <span>
                    <Check size={14} aria-hidden="true" />
                  </span>
                  <p>Balanced weekly load management</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section className="final-cta-section">
          <div className="landing-container">
            <div className="final-cta">
              <div>
                <span className="section-kicker">GET STARTED TODAY</span>

                <h2>Ready to transform your fitness routine?</h2>

                <p>
                  Join FitPlan now and experience adaptive, personalized fitness
                  planning.
                </p>
              </div>

              <Link to="/signup" className="primary-button">
                Get started for free
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-main">
            <div className="footer-brand-block">
              <Link to="/" className="footer-logo" aria-label="FitPlan home">
                <span className="footer-logo-mark">F</span>
                <span>FitPlan</span>
              </Link>

              <p className="footer-tagline">
                Smart fitness &amp; nutrition planning.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-link-group">
                <span className="footer-link-title">Explore</span>
                <a href="#features">Features</a>
                <a href="#how-it-works">How it works</a>
                <a href="#safety">Safety</a>
              </div>

              <div className="footer-link-group">
                <span className="footer-link-title">Account</span>
                <Link to="/login">Login</Link>
                <Link to="/signup">Get started</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} FitPlan. All rights reserved.
            </span>

            <span className="footer-bottom-note">
              Built for smarter, safer fitness.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}