FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install concurrently and serve globally
RUN npm install -g concurrently serve

# Copy package.json files
COPY package.json package-lock.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for root, backend, and frontend
RUN npm install && \
    cd backend && npm install && \
    cd ../frontend && npm install && \
    cd ..

# Copy all source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Go back to app root
WORKDIR /app

# Expose both ports
EXPOSE 3000 5000

# Set environment variables
ENV NODE_ENV=production
ENV REACT_APP_SERVER_URL=http://localhost:5000

# Run both services with concurrently
CMD ["concurrently", "cd backend && npm start", "serve -s frontend/build -l 3000"]
