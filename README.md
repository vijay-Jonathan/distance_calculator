# Distance Calculator

A full-stack web application for calculating distances between locations using the Haversine formula and OpenStreetMap's Nominatim API.

## Features

- Calculate distances between any two locations
- Address autocomplete using OpenStreetMap Nominatim API
- User authentication and authorization
- Save calculation history
- Switch between kilometers and miles
- Modern, responsive UI

## Tech Stack

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- Axios for API requests

### Frontend
- React (v19.0.0)
- React Router DOM (v7.4.0)
- Axios for API communication
- React Scripts (v5.0.1)
- Testing Libraries:
  - @testing-library/dom (v10.4.0)
  - @testing-library/jest-dom (v6.6.3)
  - @testing-library/react (v16.2.0)
  - @testing-library/user-event (v13.5.0)

## Setup

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone the repository
3. Run the application:
   ```bash
   docker-compose up -d
   ```
4. Access the application at `http://localhost:3000`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB: mongodb://localhost:27017

#### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs                # All containers
docker-compose logs frontend       # Frontend only
docker-compose logs backend        # Backend only
docker-compose logs mongodb        # Database only

# Stop all containers
docker-compose down

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# Rebuild and restart after code changes
docker-compose up --build -d
```

### Manual Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

4. Start the servers:
   ```bash
   # Start backend server (from backend directory)
   npm start

   # Start frontend server (from frontend directory)
   npm start
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
distance_calculator/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Distance.js
│   │   ├── User.js
│   │   └── query.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── calculate.js
│   │   └── history.js
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DistanceCalculator.js
│   │   │   ├── History.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Running Locally

To run the application locally:

### Environment Variables Setup

1. **Backend Configuration**:
   - Navigate to the `backend` directory
   - Copy the Sample.env file to create your own .env file:
     ```
     cp Sample.env .env
     ```
   - Edit the .env file to use local configurations:
     - Update MongoDB connection string to your local instance
     - Set JWT_SECRET to a secure random string
     - Configure other environment-specific variables as needed
   - Refer to `backend/Sample.env` for all required variables and examples

2. **Frontend Configuration**:
   - Navigate to the `frontend` directory
   - Copy the Sample.env file to create your own .env file:
     ```
     cp Sample.env .env
     ```
   - Edit the .env file to point to your local backend:
     - Set REACT_APP_API_URL to your local backend URL (e.g., http://localhost:4000)
   - Refer to `frontend/Sample.env` for all required variables and examples

3. **Start the Application**:
   - Start the backend: `cd backend && npm start`
   - Start the frontend: `cd frontend && npm start`
   - The application should now be running at http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Distance Calculation
- POST `/calculate` - Calculate distance between two locations
- GET `/autocomplete` - Get address suggestions
- GET `/history` - Get calculation history

## Deployment

### Frontend Deployment

The frontend can be deployed using Docker with environment variables for backend configuration:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
```

To build and run the frontend container:
```bash
# Build the image
docker build -t frontend .

# Run with environment variable for backend URL
docker run -p 80:80 -e REACT_APP_BACKEND_URL=https://your-backend-url.com frontend
```

The nginx configuration uses environment variables for flexible backend routing:
```nginx
# Proxy API requests to backend
location /api {
    proxy_pass ${REACT_APP_BACKEND_URL};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

This setup allows you to:
- Deploy the same frontend image to different environments
- Change backend URL without rebuilding the image
- Maintain secure configuration through environment variables

## Docker Configuration

### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=example

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://root:example@mongodb:27017/distance_calculator?authSource=admin
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

# System Design README

## Core Architecture Decisions


### 1. Backend Structure (Express.js Application)

The backend follows a modular Express.js architecture with these key components:

- **Route Separation**: Routes are separated into distinct files (`calculate.js`, `history.js`, `auth.js`) rather than keeping everything in server.js. This separation of concerns makes the codebase more maintainable and allows different developers to work on different features independently.

- **Model-View-Controller Pattern**: Although not explicitly labeled, the code follows MVC principles with:
  - Models: Database schemas (like the `Query` model)
  - Controllers: Logic in route handlers
  - Views: Handled by the frontend (separate from backend)

- **Middleware Usage**: The authentication middleware protects routes that require user login, showing a good understanding of Express middleware patterns for cross-cutting concerns.

### 2. External API Integration

- **Nominatim**: Used for geocoding addresses into coordinates. This is a good choice for a prototype as it's free and doesn't require API keys, though it has rate limiting considerations for production.

- **Calculation Logic**: The calculateDistance function implements the Haversine formula for calculating distances between geographic coordinates, keeping this complex math isolated in one place.

### 3. Data Persistence

- **MongoDB**: The application uses MongoDB as the database, which makes sense for this application because:
  - The schema might evolve during development
  - Query documents have a natural document structure
  - You don't need complex joins between data

### 4. Authentication

- **JWT Authentication**: Using JSON Web Tokens for authentication, which provides a stateless authentication mechanism that works well with RESTful APIs.

### 5. Deployment Strategy

- **Docker Containerization**: The Dockerfiles and Docker Compose setup show a containerized approach that:
  - Separates frontend and backend builds
  - Uses Nginx to serve static frontend assets
  - Provides development environment consistency

## System Design Diagram

```
┌─────────────────┐      ┌────────────────────────────────────────────┐
│                 │      │              Backend Server                 │
│   Web Browser   │◄────►│  ┌──────────┐  ┌─────────┐  ┌─────────┐    │
│                 │      │  │   Auth   │  │Calculate│  │ History │    │
└─────────────────┘      │  │ Endpoints│  │Endpoints│  │Endpoints│    │
                         │  └──────────┘  └─────────┘  └─────────┘    │
                         │         │            │            │        │
                         │  ┌──────▼────────────▼────────────▼──────┐ │
                         │  │           Security Layer              │ │
                         │  │  - Input Validation                   │ │
                         │  │  - Rate Limiting                      │ │
                         │  │  - Error Handling                     │ │
                         │  └──────────────────┬──────────────────┘ │
                         │                     │                     │
                         └─────────────────────┼─────────────────────┘
                                              │
                                              │
                   ┌─────────────────────────┼─────────────────────────┐
                   │                         │                         │
          ┌────────▼─────────┐      ┌────────▼─────────┐     ┌─────────▼────────┐
          │                 │      │                  │     │                   │
          │     MongoDB     │      │   Nominatim API  │     │  Distance         │
          │     Database    │      │                  │     │  Calculation      │
          │                 │      │                  │     │  Service          │
          └─────────────────┘      └──────────────────┘     └───────────────────┘
```

## Security Implementation

The application implements several security measures to ensure data integrity and prevent common attacks:

### 1. Input Validation
- **Address Validation**


### 2. Protection Against Common Attacks
- **XSS (Cross-Site Scripting)**
  - Input sanitization
  - Strict character validation
  - HTML/Script tag rejection

- **Injection Attacks**
  - SQL injection prevention
  - NoSQL injection prevention
  - Command injection prevention
  - Path traversal protection

### 3. Rate Limiting
- 1-second delay between geocoding requests
- Respects Nominatim API usage policy
- Prevents API abuse

### 4. Error Handling
- Sanitized error messages
- No internal error exposure
- Appropriate HTTP status codes

### 5. Security Test Suite
The application includes comprehensive security tests:


To run security tests:
```bash
cd backend
npm test tests/security.test.js
```
###  Security Test Results
![Security Test Results](./images/security_test_result.png)


### 6. Additional Security Measures
- HTTPS support for production
- JWT authentication for protected routes
- Secure password hashing
- CORS configuration
- Regular security updates

## Scalability Considerations

The current design has some good foundations for scalability:

1. **Stateless Backend**: The JWT approach creates a stateless backend that can easily scale horizontally.

2. **Containerization**: Docker containers support easy deployment to container orchestration platforms.

3. **Separated Concerns**: Clear separation between routes makes future microservice extraction possible.

## Improvement Opportunities

Based on the current architecture, here are some enhancements to consider:

1. **Caching Layer**: Implement Redis to cache frequently requested routes or geocoding results.

2. **Rate Limiting**: Add protection against API abuse, especially for the geocoding service which may have external limits.

3. **Error Handling Enhancement**: Implement more granular error handling for different types of failures.

4. **Background Processing**: For long-running tasks, consider adding a message queue system like RabbitMQ.

5. **API Documentation**: Integrate Swagger/OpenAPI to automatically document your endpoints.

The current architecture provides a solid foundation that balances simplicity with good software engineering practices, making it suitable for both development and potential scaling as needs grow.

## Application Screenshots



### 2. Distance Calculator
![Distance Calculator](./images/calculate.png)
```json
{
  "distance": 3862.4,
  "source": {
    "address": "New York, USA",
    "coordinates": {
      "lat": 40.7127281,
      "lon": -74.0060152
    }
  },
  "destination": {
    "address": "Los Angeles, USA",
    "coordinates": {
      "lat": 34.0536909,
      "lon": -118.242766
    }
  }
}
```

### 3. History View
![History View](./images/history.png)
```json
[
  {
    "_id": "65ff1234abcd5678ef901234",
    "source": "New York, USA",
    "destination": "Los Angeles, USA",
    "distance": 3862.4,
    "sourceCoords": {
      "lat": 40.7127281,
      "lon": -74.0060152
    },
    "destinationCoords": {
      "lat": 34.0536909,
      "lon": -118.242766
    },
    "createdAt": "2025-03-23T23:14:44.000Z"
  },
  // More history entries...
]