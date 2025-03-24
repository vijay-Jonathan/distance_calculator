# Distance Calculator Frontend

## Overview
React-based frontend for the Distance Calculator application. This web application provides a user-friendly interface for calculating distances between locations and viewing calculation history.

## Features
- User authentication (login/register)
- Address search with autocomplete
- Distance calculation between two locations
- History tracking of calculations
- Responsive design for mobile and desktop
- Dark/Light theme support

## Project Structure
```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API service calls
│   ├── context/       # React context
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   └── App.js         # Main application component
├── Dockerfile
└── package.json
```

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend service running

## Environment Variables
Copy the Sample.env file to create your own .env file:
```bash
cp Sample.env .env
```

Required environment variables:
```
REACT_APP_API_URL=http://localhost:4000
```

## Installation
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Available Scripts
- `npm start` - Run development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## Docker Support
Build the Docker image:
```bash
docker build -t distance-calculator-frontend .
```

Run the container:
```bash
docker run -p 80:80 distance-calculator-frontend
```

## Features in Detail

### Authentication
- User registration with email and password
- JWT-based authentication
- Protected routes for authenticated users

### Distance Calculator
- Address search with autocomplete suggestions
- Real-time distance calculation
- Support for various units (kilometers, miles)
- Visual feedback during calculation

### History Tracking
- View past calculations
- Sort and filter history
- Delete individual history entries

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
