import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", repeat: "" });
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username || form.username.length < 3)
      newErrors.username = "Username must be at least 3 characters.";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.password || form.password.length < 8 || !/\d/.test(form.password))
      newErrors.password = "Password must be at least 8 characters and contain a number.";
    if (form.password !== form.repeat)
      newErrors.repeat = "The two passwords do not match.";
    if (!agreed)
      newErrors.agreed = "You must agree to the Terms and Conditions.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      if (data.message === "Registered successfully") {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrors({ username: data.error || "Registration failed." });
      }
    } catch {
      setErrors({ username: "Server error. Please try again." });
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
        <h2>Create account</h2>
        <p className="auth-sub">Join the DevPink community</p>

        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field-group">
              <label>Username</label>
              <input
                name="username"
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
              />
            </div>
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Repeat Password</label>
              <input
                name="repeat"
                type="password"
                placeholder="••••••••"
                value={form.repeat}
                onChange={handleChange}
                className={errors.repeat ? "input-error" : ""}
              />
            </div>
            {errors.repeat && <span className="field-error">{errors.repeat}</span>}
          </div>

          <div className={`checkbox-row ${errors.agreed ? "checkbox-error" : ""}`}>
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setErrors({ ...errors, agreed: "" });
              }}
            />
            <label htmlFor="terms">I agree to the Terms and Conditions and Privacy Policy</label>
          </div>
          {errors.agreed && <span className="field-error">{errors.agreed}</span>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
