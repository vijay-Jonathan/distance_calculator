import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCalculate = async () => {
    try {
      const response = await axios.post('http://localhost:4000/calculate', { source, destination });
      setDistance(response.data.distance);
      setError('');
      fetchHistory();
    } catch (err) {
      setError('Failed to calculate distance');
      setDistance(null);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:4000/history');
      setHistory(response.data);
    } catch (err) {
      setError('Failed to fetch history');
    }
  };

  return (
    <div className="App">
      <h1>Distance Calculator</h1>
      <input
        type="text"
        placeholder="Source Address"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <input
        type="text"
        placeholder="Destination Address"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <button onClick={handleCalculate}>Calculate Distance</button>
      {error && <p className="error">{error}</p>}
      {distance && <p>Distance: {distance} km</p>}
      <h2>Past Queries</h2>
      <ul>
        {history.map((item, index) => (
          <li key={index}>{item.source} to {item.destination}: {item.distance} km</li>
        ))}
      </ul>
    </div>
  );
}

export default App;