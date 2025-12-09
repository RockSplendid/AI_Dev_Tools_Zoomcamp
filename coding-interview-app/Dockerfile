FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install concurrently and serve globally
RUN npm install -g concurrently serve

# Build-time environment defaults - use empty string to use same origin
ARG REACT_APP_API_URL=
ARG REACT_APP_WS_URL=
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

# Expose single port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run backend only - it will serve the static frontend
CMD ["sh", "-c", "cd backend && PORT=$PORT npm start"]
