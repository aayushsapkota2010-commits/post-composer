import { useState } from "react";
import api from "../api/api";
import "./Login.css";

interface LoginProps {
  onLogin: () => void;
}

interface LoginResponse {
  token: string;
}

interface UserResponse {
  role: string;
  name: string;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Save JWT
      localStorage.setItem("token", response.data.token);

      // Get logged-in user details
      const userResponse = await api.get<UserResponse>("/user/me", {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
        },
      });

      // Save role and name
      localStorage.setItem("role", userResponse.data.role);
      localStorage.setItem("name", userResponse.data.name);

      onLogin();
    } catch (error: unknown) {
      console.error(error);

      // Remove token if login/user request fails
      localStorage.removeItem("token");

      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
      </div>

      <div className="login-card">

        <div className="login-brand">
          <div className="brand-icon">
            ✦
          </div>

          <div>
            <h1>PostFlow</h1>
            <p>Social Media Management</p>
          </div>
        </div>

        <div className="login-header">
          <h2>Welcome back 👋</h2>
          <p>
            Sign in to manage your posts and schedule content.
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">

          <div className="input-group">
            <label htmlFor="email">Email Address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="arrow">→</span>
              </>
            )}
          </button>

        </form>

        <div className="login-footer">
          <span>Secure access powered by</span>
          <strong>JWT Authentication</strong>
        </div>

      </div>
    </div>
  );
}

export default Login;