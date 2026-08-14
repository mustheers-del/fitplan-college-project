import "./Login.css";

export default function Login() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="login-logo">F</div>
          <span>FitPlan</span>
        </div>

        <div className="login-content">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to continue your fitness journey.</p>
          </div>

          <form className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="Enter your email" />
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password">Forgot password?</a>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>

            <button type="button" className="login-button">
              Sign in
            </button>
          </form>

          <p className="login-signup">
            Don't have an account? <a href="/signup">Create an account</a>
          </p>
        </div>
      </section>

      <section className="login-visual">
        <div className="login-visual-content">
          <span className="login-badge">FITPLAN</span>
          <h2>
            Build better habits.
            <br />
            Become stronger.
          </h2>
          <p>Your personalized fitness journey, all in one place.</p>
        </div>
      </section>
    </main>
  );
}
