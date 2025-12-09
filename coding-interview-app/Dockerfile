FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install concurrently and serve globally
RUN npm install -g concurrently serve

# Build-time environment defaults (Render can override via build args)
ARG REACT_APP_API_URL=http://localhost:8080
ARG REACT_APP_WS_URL=http://localhost:8080
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_WS_URL=${REACT_APP_WS_URL}

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
EXPOSE 3000 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_PORT=8080

# Run both services with concurrently (shell to expand env vars)
CMD ["sh", "-c", "concurrently \"cd backend && BACKEND_PORT=$BACKEND_PORT PORT=$BACKEND_PORT npm start\" \"serve -s frontend/build -l $PORT\""]
