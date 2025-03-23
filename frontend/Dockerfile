# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Install serve for production static server
RUN npm install -g serve

# Expose port
EXPOSE 80

# Start static server
CMD ["serve", "-s", "build", "-l", "80"]
