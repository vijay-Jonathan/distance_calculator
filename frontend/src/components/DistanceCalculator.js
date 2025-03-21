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
  const [metric, setMetric] = useState("km");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

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
        { source, destination, metric },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDistance(response.data.distance); // API returns distance based on selected metric
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

  const handleSourceChange = async (e) => {
    setSource(e.target.value);
    if (e.target.value.length > 2) {
      const response = await axios.get('http://localhost:4000/autocomplete', {
        params: { input: e.target.value },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSourceSuggestions(response.data);
    } else {
      setSourceSuggestions([]);
    }
  };

  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);
    if (e.target.value.length > 2) {
      const response = await axios.get('http://localhost:4000/autocomplete', {
        params: { input: e.target.value },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDestinationSuggestions(response.data);
    } else {
      setDestinationSuggestions([]);
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

          .suggestions-list {
            list-style-type: none;
            padding: 0;
            margin: 0;
            border: 1px solid #ccc;
            max-height: 150px;
            overflow-y: auto;
            background-color: #fff;
            z-index: 1;
            position: absolute;
            width: 100%;
          }

          .suggestions-list li {
            padding: 10px;
            cursor: pointer;
          }

          .suggestions-list li:hover {
            background-color: #f0f0f0;
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
            onChange={handleSourceChange}
            className="calculator-input"
          />
          {sourceSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {sourceSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => setSource(suggestion.display_name)}>
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
          <input
            type="text"
            placeholder="Destination Address"
            value={destination}
            onChange={handleDestinationChange}
            className="calculator-input"
          />
          {destinationSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {destinationSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => setDestination(suggestion.display_name)}>
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
          <button onClick={handleCalculate} className="calculate-button">
            Calculate Distance
          </button>

          {error && <p className="error-message">{error}</p>}
          {distance && (
            <p className="distance-result">
              Distance: {metric === "km" && `${distance} km`}
              {metric === "miles" && `${(distance * 0.621371).toFixed(2)} miles`}
              {metric === "both" && `${distance} km (${(distance * 0.621371).toFixed(2)} miles)`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistanceCalculator;