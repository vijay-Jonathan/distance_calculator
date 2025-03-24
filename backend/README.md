# Distance Calculator Backend

## Overview
Backend service for the Distance Calculator application, built with Node.js, Express, and MongoDB. This service handles user authentication, distance calculations, and history tracking.

## Features
- User authentication with JWT
- Distance calculation using Haversine formula
- Geocoding integration with Nominatim API
- Query history tracking
- MongoDB database integration

## Project Structure
```
backend/
├── config/
│   └── db.js          # Database configuration
├── middleware/
│   └── auth.js        # Authentication middleware
├── models/
│   ├── Distance.js    # Distance calculation model
│   ├── User.js        # User model
│   └── query.js       # Query history model
├── routes/
│   ├── auth.js        # Authentication routes
│   ├── calculate.js   # Distance calculation routes
│   └── history.js     # History tracking routes
├── Dockerfile         # Docker configuration
├── package.json       # Dependencies and scripts
└── server.js         # Main application file
```

## Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Environment Variables
Copy the Sample.env file to create your own .env file:
```bash
cp Sample.env .env
```

Required environment variables:
```
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Installation
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and get token
- `GET /api/auth/me` - Get current user profile

### Distance Calculation
- `POST /api/calculate` - Calculate distance between two locations
- `GET /api/calculate/history` - Get calculation history

### History
- `GET /api/history` - Get user's calculation history
- `DELETE /api/history/:id` - Delete a specific history entry

## Docker Support
Build the Docker image:
```bash
docker build -t distance-calculator-backend .
```

Run the container:
```bash
docker run -p 4000:4000 distance-calculator-backend
```

## Testing
Run the test suite:
```bash
npm test
```

## Error Handling
The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "error": "Error message description"
}
```
