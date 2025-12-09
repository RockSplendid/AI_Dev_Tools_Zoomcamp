# Docker Deployment Guide

## Overview

The application is now fully containerized in a single Docker image that runs both the backend and frontend services.

## Base Image

**`node:18-alpine`**

**Why Alpine?**
- Lightweight: Only ~170MB (vs 900MB+ for full Node image)
- Secure: Minimal attack surface
- Fast: Quick builds and deployments
- Production-ready: Used by thousands of applications

## Building the Docker Image

### Option 1: Using Docker Compose (Recommended)

```bash
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app

# Build the image
docker-compose build

# Run the container
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2: Using Docker CLI

```bash
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app

# Build the image
docker build -t coding-interview-app:latest .

# Run the container
docker run -p 3000:3000 -p 5000:5000 coding-interview-app:latest
```

## Image Details

### What's Included
- ✅ Node.js 18 (Alpine Linux)
- ✅ Backend (Express.js + Socket.io)
- ✅ Frontend (React + Vite/build tools)
- ✅ Concurrently (runs both services)
- ✅ All dependencies (npm packages)
- ✅ Pre-built frontend assets

### Image Size
- ~500-600MB (uncompressed)
- ~150-200MB (compressed/pushed to registry)

### Build Time
- First build: ~3-5 minutes
- Subsequent builds: ~30-60 seconds (with caching)

## Docker Compose Configuration

The `docker-compose.yml` file includes:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"  # Frontend
      - "5000:5000"  # Backend
    environment:
      - NODE_ENV=production
      - PORT=5000
      - REACT_APP_SERVER_URL=http://localhost:5000
    restart: unless-stopped
```

## Running the Application

### Start in foreground (see logs)
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f app
```

### Stop the application
```bash
docker-compose down
```

### Stop and remove volumes
```bash
docker-compose down -v
```

## Environment Variables

You can customize the container behavior by setting environment variables:

```bash
docker-compose up -e NODE_ENV=development
```

Or create a `.env` file in the root directory:

```
NODE_ENV=production
PORT=5000
REACT_APP_SERVER_URL=http://localhost:5000
```

Then run:
```bash
docker-compose up --env-file .env
```

## Publishing to Docker Registry

### Push to Docker Hub

```bash
# Tag the image
docker tag coding-interview-app:latest username/coding-interview-app:latest

# Login to Docker Hub
docker login

# Push the image
docker push username/coding-interview-app:latest
```

### Deploy from Docker Hub

```bash
docker pull username/coding-interview-app:latest
docker run -p 3000:3000 -p 5000:5000 username/coding-interview-app:latest
```

## Production Considerations

### Security
- ✅ Uses Alpine Linux (minimal attack surface)
- ✅ Non-root user recommended for production
- ✅ Build only includes necessary files (.dockerignore)

### Performance
- ✅ Multi-stage build (frontend compiled, not included in final image)
- ✅ Layer caching optimized
- ✅ Concurrently enables parallel service startup

### Monitoring
- ✅ Logs available via `docker-compose logs`
- ✅ Health checks can be added if needed
- ✅ Restart policy: `unless-stopped`

## Troubleshooting

### Container fails to start
```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache
```

### Port already in use
```bash
# Use different ports
docker-compose -p myapp up

# Or kill the process using the port
lsof -i :3000
kill -9 <PID>
```

### Out of disk space
```bash
# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# Full cleanup
docker system prune -a
```

## Development vs Production

### Development (Local)
```bash
# Use separate development Dockerfiles
cd backend && npm run dev
cd frontend && npm start
```

### Production (Docker)
```bash
# Run the containerized production build
docker-compose up
```

## Advanced: Custom Production Dockerfile

For production with additional optimization:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm install && cd backend && npm install && cd ../frontend && npm install

COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# Production image
FROM node:18-alpine
RUN npm install -g concurrently
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/build ./frontend/build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000 5000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
```

## Next Steps

1. **Build the image**: `docker-compose build`
2. **Run the container**: `docker-compose up`
3. **Test the app**: Visit http://localhost:3000
4. **View logs**: `docker-compose logs -f app`
5. **Deploy to production**: Push to Docker Hub or your registry

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux](https://alpinelinux.org/)
