import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, confirmSignUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signUp(email.trim(), password);
      setStep("confirm");
    } catch (err) {
      console.error(err);
      setError("Could not create the account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await confirmSignUp(email.trim(), code.trim());

      navigate("/onboarding");
    } catch (err) {
      console.error(err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <div
        style={{
          padding: "40px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h1>Verify your email</h1>

        <p style={{ marginTop: "10px", marginBottom: "20px" }}>
          We sent a verification code to <strong>{email}</strong>.
        </p>

        <form onSubmit={handleConfirm}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="code">Verification code</label>

            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "16px" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p style={{ marginTop: "20px" }}>
          Already verified? <Link to="/login">Go to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Create Account</h1>

      <p style={{ marginTop: "10px", marginBottom: "20px" }}>
        Create your FitPlan account to get started.
      </p>

      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            minLength={8}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
            }}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: "20px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
