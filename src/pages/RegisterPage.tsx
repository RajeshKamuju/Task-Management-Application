import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserPlus, User, Mail, Key, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // Save credentials in session
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", String(response.data.userId));
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem("userEmail", response.data.userEmail);

      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. Try again with unique details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center" id="register-container">
      <div className="card shadow-lg p-4 border-0 rounded-4 w-full" style={{ maxWidth: "450px" }}>
        
        {/* Header content decoration */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 bg-success bg-opacity-10 text-success rounded-circle mb-3">
            <UserPlus size={32} />
          </div>
          <h2 className="fw-bold text-dark">Get started</h2>
          <p className="text-muted small">Create your account in just a few seconds</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3 rounded-3" role="alert" id="register-error-alert">
            <ShieldAlert size={18} className="text-danger flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} id="register-form">
          {/* Full Name field */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <User size={16} />
              </span>
              <input
                type="text"
                id="register-name-input"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Alice Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Address field */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <Mail size={16} />
              </span>
              <input
                type="email"
                id="register-email-input"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <Key size={16} />
              </span>
              <input
                type="password"
                id="register-password-input"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-text text-start text-xs text-muted" style={{ fontSize: "11px" }}>
              Must have at least 6 characters.
            </div>
          </div>

          {/* Password verification field */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Verify Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <Key size={16} />
              </span>
              <input
                type="password"
                id="register-confirm-password-input"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            id="register-submit-button"
            className="btn btn-success w-100 py-2.5 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? "Registering account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top border-light">
          <p className="text-muted mb-0 small">
            Already have an account?{" "}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign in instead
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
