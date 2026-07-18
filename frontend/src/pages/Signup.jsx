import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorMessage } from "../components/Feedback.jsx";

const Signup = () => {
  const { register, authError, authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setValidationError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    const success = await register(form.name, form.email, form.password);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">📚 StudySync</h1>
        <p className="auth-subtitle">Create an account to start planning your studies.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />
          </label>

          <ErrorMessage message={validationError || authError} />

          <button type="submit" className="btn-primary" disabled={authLoading}>
            {authLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
