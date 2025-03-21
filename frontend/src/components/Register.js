import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/auth/register", {
        username,
        email,
        password,
      });
      setMessage("User registered successfully");
      setError("");
      navigate("/login");
    } catch (err) {
      setError("User already exists");
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
        <h1 className="login-title">Register</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="login-input"
          />
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
          {message && <p className="success-message">{message}</p>}
          <button type="submit" className="login-button">
            Create Account
          </button>
        </form>
        <div className="login-footer">
          <div className="account-prompt">
            <span className="account-text">Already have an account?</span>
            <Link to="/login" className="create-account-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
