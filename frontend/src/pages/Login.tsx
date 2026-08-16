import { useState } from "react";
import "./Login.css";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <svg
            className="fitplan-logo"
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

            <path fill="#2563EB" d="M9 25h15l-5 28c-1 5-4 8-9 8H5L9 25Z" />
          </svg>

          <span className="login-brand-name">FitPlan</span>
        </div>

        <div className="login-heading">
          <h1>Welcome Back 👋</h1>
          <p>Sign in to continue your fitness journey</p>
        </div>

        <form className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button className="login-button" type="submit">
            Sign In
          </button>
        </form>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button
            type="button"
            aria-label="Continue with Google"
            className="social-button"
          >
            <FcGoogle size={22} />
          </button>

          <button
            type="button"
            aria-label="Continue with Apple"
            className="social-button"
          >
            <FaApple size={22} />
          </button>
        </div>

        <p className="login-signup">
          Don't have an account? <a href="/signup">Create Account</a>
        </p>
      </section>
    </main>
  );
}
