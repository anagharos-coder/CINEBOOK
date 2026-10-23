import { useState } from "react";
import "./AuthPage.css";

const API_URL = "https://cinebook-1-494j.onrender.com/api/auth";

function AuthPage({ onBack, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (isRegister) {
        setMessage("Registration successful! Please log in.");
        setIsRegister(false);
        setPassword("");
      } else {
        const user = data.user;
        const token = data.token;

        if (!user || !token) {
          throw new Error("The server did not return a user and token.");
        }

        localStorage.setItem("cinebookToken", token);
        localStorage.setItem("cinebookUser", JSON.stringify(user));
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">
          CINE<span>BOOK</span>
        </h1>

        <h2>{isRegister ? "Create Your Account" : "Welcome Back!"}</h2>

        <p className="auth-subtitle">
          {isRegister
            ? "Join CINEBOOK and plan your next movie night."
            : "Log in to your CINEBOOK account."}
        </p>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to CINEBOOK?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setError("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>

        <button className="auth-back" type="button" onClick={onBack}>
          ← Back to Movies
        </button>
      </div>
    </div>
  );
}

export default AuthPage;