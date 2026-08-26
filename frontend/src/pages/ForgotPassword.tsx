import "./ForgotPassword.css";

export default function ForgotPassword() {
  return (
    <main className="forgot-page">
      <section className="forgot-card">

        <div className="forgot-brand">
          <svg
            className="forgot-logo"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="FitPlan logo"
          >
            <path
              fill="#2563EB"
              d="M13 7h39c5 0 7 3 6 7l-1 3c-1 4-4 6-8 6H11c-3 0-5-3-4-6l1-4c1-4 2-6 5-6Z"
            />

            <path
              fill="#14B8A6"
              d="M11 25h31c5 0 7 3 6 7l-1 3c-1 4-4 6-8 6H9l2-16Z"
            />

            <path
              fill="#2563EB"
              d="M9 25h15l-5 28c-1 5-4 8-9 8H5L9 25Z"
            />
          </svg>

          <span>FitPlan</span>
        </div>

        <div className="forgot-heading">
          <h1>Forgot Password?</h1>

          <p>
            No worries! Enter your email address and we'll send you
            instructions to reset your password.
          </p>
        </div>

        <form className="forgot-form">
          <div className="forgot-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <button type="button" className="forgot-button">
            Send Reset Link
          </button>
        </form>

        <a href="/login" className="back-login">
          ← Back to Sign In
        </a>

      </section>
    </main>
  );
}