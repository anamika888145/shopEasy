
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const LoginForm = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email aur password enter karo.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
  "http://localhost:5000/api/auth/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  }
);

      const data = await response.json();

      console.log("Login API response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const token = data.token;

      if (!token) {
        console.error("API response mein token missing hai:", data);
        throw new Error(
          "Backend se token nahi mila. Login API response check karo."
        );
      }

      // Token aur user save karo
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log(
        "Token saved:",
        Boolean(localStorage.getItem("token"))
      );

      // App ko successful login ki information do
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(data.user, token);
      }

      // Other components ko auth update ki information do
      window.dispatchEvent(new Event("shopeasy-auth"));

      // Login modal close karo
      if (typeof onClose === "function") {
        onClose();
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Login nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-card-header">
        <span className="login-mini-badge">
          ✦ WELCOME BACK
        </span>

        <h2>Login to ShopEasy</h2>

        <p>
          Continue your premium shopping experience.
        </p>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-input-group">
          <label htmlFor="login-email">Email Address</label>

          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-input-group">
          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="login-error" role="alert">
            ⚠ {error}
          </div>
        )}

        <button
          type="submit"
          className="login-submit-btn"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Login to ShopEasy →"}
        </button>
      </form>

      <div className="login-security-note">
        🔒 Secure authentication
      </div>
    </div>
  );
};

export default LoginForm;
