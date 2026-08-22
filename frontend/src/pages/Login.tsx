import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signOut, userId, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (!authLoading && userId) {
    return (
      <div
        style={{
          padding: "40px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h1>Already signed in</h1>

        <p style={{ marginBottom: "20px" }}>
          You are already signed in. Sign out before logging in with another
          account.
        </p>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.reload();
          }}
        >
          Sign out
        </button>
      </div>
    );
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      setError(
        err?.message ||
          err?.name ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@fitplan.test"
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              color: "#111827",
              backgroundColor: "#ffffff",
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
            placeholder="Password"
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              color: "#111827",
              backgroundColor: "#ffffff",
            }}
          />

          <p style={{ marginTop: "8px", textAlign: "right" }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>

        {error && (
          <p
            style={{
              color: "red",
              marginBottom: "16px",
            }}
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "20px" }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}