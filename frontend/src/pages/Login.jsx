import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorMessage } from "../components/Feedback.jsx";

const Login = () => {
  const { login, authError, authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!form.email || !form.password) {
      setValidationError("Please fill in both fields.");
      return;
    }

    const success = await login(form.email, form.password);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">📚 StudySync</h1>
        <p className="auth-subtitle">Welcome back! Log in to continue studying.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
              placeholder="••••••••"
            />
          </label>

          <ErrorMessage message={validationError || authError} />

          <button type="submit" className="btn-primary" disabled={authLoading}>
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
