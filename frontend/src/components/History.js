import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const History = ({ userId, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
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
    <div className="calculator-page history-page">
      <nav className="calculator-nav">
        <div className="nav-content">
          <h2>Distance Calculator</h2>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Calculator
            </Link>
            <Link to="/history" className="nav-link active">
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
        <h2 className="section-title">Past Queries</h2>
        {error && <p className="error">{error}</p>}
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Destination</th>
                <th>Distance (km)</th>
                <th>Distance (miles)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="history-row">
                  <td>{item.source}</td>
                  <td>{item.destination}</td>
                  <td>{item.distance} km</td>
                  <td>{(item.distance * 0.621371).toFixed(2)} miles</td>
                  <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
