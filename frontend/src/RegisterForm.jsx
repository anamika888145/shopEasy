
import { useState } from "react";

function RegisterForm({ onClose, onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!name || !email || !password) {
      setError("Name, email aur password bharna zaroori hai.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // JWT token save karo
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // User save karo
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      console.log("REGISTER SUCCESS");
      console.log(
        "TOKEN SAVED:",
        !!localStorage.getItem("token")
      );

      alert("Registration successfully ho gaya!");

      if (onRegisterSuccess) {
        onRegisterSuccess(data.user);
      }

      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setError(
        "Server se connection nahi ho pa raha. Backend check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>

        <button
          type="button"
          style={styles.closeBtn}
          onClick={onClose}
        >
          ✕
        </button>

        <h2 style={styles.title}>
          Create Account
        </h2>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Account ban raha hai..."
              : "Register"}
          </button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  container: {
    width: "90%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    position: "relative",
    boxSizing: "border-box",
  },

  closeBtn: {
    position: "absolute",
    right: "15px",
    top: "15px",
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "26px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ff6b35",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  error: {
    backgroundColor: "#ffe5e5",
    color: "#d00000",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
  },
};

export default RegisterForm;
