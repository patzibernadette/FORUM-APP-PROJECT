import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../api";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost("/auth/login", form);
      if (data.success) {
        login(data.token, data.username);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid login.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-logo">✦</span>
        <h1>DevPink</h1>
        <p>Where developers ask, answer, and grow.</p>
      </div>

      <div className="auth-card fade-in">
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Username</label>
            <input
              name="username"
              type="text"
              placeholder="your_username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
