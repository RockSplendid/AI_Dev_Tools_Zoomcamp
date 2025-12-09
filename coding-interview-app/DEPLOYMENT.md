# Deployment Guide

This guide covers deploying the Online Coding Interview App to various platforms.

## Local Development

### Quick Start

```bash
# Clone and setup
git clone <repository>
cd coding-interview-app
chmod +x setup.sh
./setup.sh

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Docker Setup

```bash
docker-compose up
```

Then access the app at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Deployment

### Backend Deployment

#### Option 1: Heroku

```bash
cd backend

# Initialize Heroku app
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set PORT=5000
heroku config:set FRONTEND_URL=https://your-frontend-url.com
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Option 2: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

cd backend

# Login and create project
railway login
railway init

# Deploy
railway up
```

#### Option 3: AWS EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone <repository>
cd coding-interview-app/backend

# Install dependencies
npm install

# Set environment variables
export PORT=5000
export FRONTEND_URL=https://your-frontend-url.com
export NODE_ENV=production

# Start with PM2
npm install -g pm2
pm2 start server.js --name "coding-interview-backend"
pm2 startup
pm2 save
```

#### Option 4: Docker on Any Server

```bash
# Build Docker image
docker build -f Dockerfile.backend -t coding-interview-backend .

# Run container
docker run -d \
  -p 5000:5000 \
  -e PORT=5000 \
  -e FRONTEND_URL=https://your-frontend-url.com \
  -e NODE_ENV=production \
  --name backend \
  coding-interview-backend
```

### Frontend Deployment

#### Option 1: Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# REACT_APP_SERVER_URL=https://your-backend-url.com
```

#### Option 2: Netlify

```bash
cd frontend

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### Option 3: AWS S3 + CloudFront

```bash
cd frontend

# Build
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Sync to S3
aws s3 sync build/ s3://your-bucket-name/

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Option 4: GitHub Pages

```bash
cd frontend

# Add to package.json
"homepage": "https://yourusername.github.io/coding-interview-app"

# Build and deploy
npm run build
npm install --save-dev gh-pages

# Add deploy script to package.json
"deploy": "gh-pages -d build"

npm run deploy
```

#### Option 5: Docker on Any Server

```bash
# Build Docker image
docker build -f Dockerfile.frontend -t coding-interview-frontend .

# Run container
docker run -d \
  -p 3000:3000 \
  -e REACT_APP_SERVER_URL=https://your-backend-url.com \
  --name frontend \
  coding-interview-frontend
```

## Full Stack Deployment with Docker Compose

```bash
# Production docker-compose.yml
version: '3.8'

services:
  backend:
    image: coding-interview-backend:latest
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - FRONTEND_URL=https://your-frontend-url.com
      - NODE_ENV=production
    restart: always

  frontend:
    image: coding-interview-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_SERVER_URL=https://your-backend-url.com
    restart: always

volumes:
  postgres_data:

# Deploy
docker-compose -f docker-compose.yml up -d
```

## SSL/HTTPS Setup

### Using Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/coding-interview

upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Let's Encrypt

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --standalone -d api.example.com
sudo certbot certonly --standalone -d app.example.com
```

## Environment Variables

### Backend (.env)

```
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname  # Optional
API_KEY=your-api-key  # For third-party services
```

### Frontend (.env)

```
REACT_APP_SERVER_URL=https://your-backend-url.com
REACT_APP_ENVIRONMENT=production
```

## Monitoring and Logging

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start server.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Setup automatic restart
pm2 startup
pm2 save
```

### Using CloudWatch (AWS)

```bash
# Install CloudWatch agent
wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure and start
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config -m ec2 -s
```

## Database Integration

To persist session data, integrate MongoDB or PostgreSQL:

### MongoDB

```bash
# In backend/server.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-interview', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### PostgreSQL

```bash
# Install Sequelize
npm install sequelize pg pg-hstore

# In backend/server.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres'
});
```

## Scaling

### Horizontal Scaling with Load Balancer

```bash
# Use Nginx as load balancer
upstream backend {
    server backend1.example.com:5000;
    server backend2.example.com:5000;
    server backend3.example.com:5000;
}

server {
    listen 5000;
    location / {
        proxy_pass http://backend;
    }
}
```

### Using Redis for Session Management

```bash
# Install Redis
npm install redis express-session connect-redis

# In server.js
const redis = require('redis');
const RedisStore = require('connect-redis').default;
const client = redis.createClient();
```

## Performance Optimization

1. **Enable Gzip Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add CDN for Frontend Assets**
   - CloudFront, CloudFlare, or similar

3. **Database Indexing**
   - Index frequently queried fields

4. **Code Splitting**
   - React lazy loading in frontend

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` matches frontend origin
2. **WebSocket Connection Failed**: Check firewall and proxy settings
3. **Out of Memory**: Increase server resources or enable clustering
4. **High Latency**: Use CDN and optimize database queries

### Health Checks

```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:3000
```

## Backup and Recovery

```bash
# Backup database
pg_dump coding_interview > backup.sql

# Restore database
psql coding_interview < backup.sql

# Export session data
mongodump --db coding-interview --out ./backup/
```

## Support

For deployment issues, refer to:
- Backend: [Node.js Hosting Guides](https://nodejs.org/en/docs/guides/nodejs-web-application-architecture/)
- Frontend: [React Deployment](https://create-react-app.dev/deployment/)
