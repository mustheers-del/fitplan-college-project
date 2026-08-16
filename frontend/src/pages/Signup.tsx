import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import "./Signup.css";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="signup-page">
      <section className="signup-card">
        <div className="signup-brand">
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

          <span className="signup-brand-name">FitPlan</span>
        </div>

        <div className="signup-heading">
          <h1>Create Your Account</h1>
          <p>Start your fitness journey today</p>
        </div>

        <form className="signup-form">
          <div className="signup-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="Enter your full name" />
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Enter your email" />
          </div>

          <div className="signup-field">
            <label htmlFor="password">Password</label>

            <div className="signup-password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className="signup-password-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="signup-terms">
            <input type="checkbox" />
            <span>
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </span>
          </label>

          <button type="button" className="signup-button">
            Create Account
          </button>
        </form>

        <div className="signup-divider">
          <span>or continue with</span>
        </div>

        <div className="signup-social-login">
          <button type="button" aria-label="Continue with Google">
            <FcGoogle size={22} />
          </button>

          <button type="button" aria-label="Continue with Apple">
            <FaApple size={22} />
          </button>
        </div>

        <p className="signup-login-link">
          Already have an account? <a href="/login">Sign In</a>
        </p>
      </section>
    </main>
  );
}
