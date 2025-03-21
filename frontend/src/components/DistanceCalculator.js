import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DistanceCalculator = ({ userId, onLogout }) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchHistory();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/auth/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsername(response.data.username || response.data.email);
    } catch (err) {
      console.error("Failed to fetch user data");
    }
  };

  const handleCalculate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/calculate",
        { source, destination },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setDistance(response.data.distance);
      setError("");
      fetchHistory();
    } catch (err) {
      setError("Failed to calculate distance");
      setDistance(null);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:4000/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistory(response.data);
    } catch (err) {
      setError("Failed to fetch history");
    }
  };

  return (
    <div className="calculator-page">
      <nav className="calculator-nav">
        <div className="nav-content">
          <h2>Distance Calculator</h2>
          <div className="nav-links">
            <Link to="/" className="nav-link active">
              Calculator
            </Link>
            <Link to="/history" className="nav-link">
              History
            </Link>
          </div>
          <div className="user-controls">
            <span className="username">Welcome, {username}</span>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="calculator-container">
        <div className="calculator-form">
          <input
            type="text"
            placeholder="Source Address"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="calculator-input"
          />
          <input
            type="text"
            placeholder="Destination Address"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="calculator-input"
          />
          <button onClick={handleCalculate} className="calculate-button">
            Calculate Distance
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {distance && <p className="distance-result">Distance: {distance} km</p>}
      </div>
    </div>
  );
};

export default DistanceCalculator;
