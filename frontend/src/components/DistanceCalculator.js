/**
 * DistanceCalculator Component
 * 
 * A React component that provides a user interface for calculating distances between
 * two locations. It includes features like address input, distance calculation,
 * metric selection (km/miles), and viewing calculation history.
 * 
 * Props:
 * @param {string} userId - The ID of the currently logged in user
 * @param {function} onLogout - Callback function to handle user logout
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DistanceCalculator = ({ userId, onLogout }) => {
  // State management for form inputs and data
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [username, setUsername] = useState("");
  const [metric, setMetric] = useState("km"); // Distance metric state

  useEffect(() => {
    fetchHistory();
    fetchUserData();
  }, []);

  /**
   * Fetches user data from the backend API
   */
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

  /**
   * Handles the distance calculation
   * Makes API request to calculate distance between source and destination
   */
  const handleCalculate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/calculate",
        { source, destination, metric },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setDistance(response.data.distance); // API returns distance in km
      setError("");
      fetchHistory();
    } catch (err) {
      setError("Failed to calculate distance");
      setDistance(null);
    }
  };

  /**
   * Fetches calculation history from the backend API
   */
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
      <style>
        {`
          .mode-selector {
            margin-bottom: 20px;
            width: 100%;
          }

          .radio-group {
            display: flex;
            justify-content: center;
            gap: 20px;
          }

          .radio-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
          }

          .radio-input {
            margin-right: 8px;
            cursor: pointer;
          }

          .radio-text {
            font-size: 16px;
            color: #ffffff;
          }

          .radio-input:checked + .radio-text {
            color: #00ffff;
            font-weight: 500;
          }
        `}
      </style>
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
          <div className="mode-selector">
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="metric"
                  value="km"
                  checked={metric === "km"}
                  onChange={(e) => setMetric(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-text">Kilometers</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="metric"
                  value="miles"
                  checked={metric === "miles"}
                  onChange={(e) => setMetric(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-text">Miles</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="metric"
                  value="both"
                  checked={metric === "both"}
                  onChange={(e) => setMetric(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-text">Both</span>
              </label>
            </div>
          </div>
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
        {distance && (
          <p className="distance-result">
            Distance: {metric === "km" && `${distance} km`}
            {metric === "miles" && `${(distance * 0.621371).toFixed(2)} miles`}
            {metric === "both" &&
              `${distance} km (${(distance * 0.621371).toFixed(2)} miles)`}
          </p>
        )}
      </div>
    </div>
  );
};

export default DistanceCalculator;