import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        { email, password },
      );
      onLogin(response.data.token);
      setError("");
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/1368047b7f81456c85b53885af8fff3a/df3a648c2dcd5ba124ec2c15261ef4d1a473fc47?placeholderIfAbsent=true"
        alt=""
        className="login-background"
      />
      <div className="login-container">
        <h1 className="login-title">LogIn</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="login-input"
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Sign In.
          </button>
        </form>
        <div className="login-footer">
          <div className="account-prompt">
            <span className="account-text">don't have an account?</span>
            <Link to="/register" className="create-account-link">
              Create a account
            </Link>
          </div>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
