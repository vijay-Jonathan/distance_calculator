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
