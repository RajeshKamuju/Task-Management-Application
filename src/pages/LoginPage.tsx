import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { LogIn, Key, Mail, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", { email, password });
      
      // Store session attributes securely
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", String(response.data.userId));
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem("userEmail", response.data.userEmail);
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials. Please attempt again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center" id="login-container">
      <div className="card shadow-lg p-4 border-0 rounded-4 w-full" style={{ maxWidth: "450px" }}>
        
        {/* Header decoration */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 bg-primary bg-opacity-10 text-primary rounded-circle mb-3">
            <LogIn size={32} />
          </div>
          <h2 className="fw-bold text-dark">Welcome back</h2>
          <p className="text-muted small">Manage and track your tasks securely</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3 rounded-3" role="alert" id="login-error-alert">
            <ShieldAlert size={18} className="text-danger flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} id="login-form">
          {/* Email input field */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <Mail size={16} />
              </span>
              <input
                type="email"
                id="login-email-input"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <Key size={16} />
              </span>
              <input
                type="password"
                id="login-password-input"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-button"
            className="btn btn-primary w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top border-light">
          <p className="text-muted mb-0 small">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Sign up free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
