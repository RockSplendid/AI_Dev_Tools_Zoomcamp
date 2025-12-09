#!/bin/bash

# Online Coding Interview App - Setup Script
# This script automates the installation of both backend and frontend

set -e

echo "🚀 Setting up Online Coding Interview App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ npm version: $(npm -v)"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file. Please configure it if needed."
fi

npm install
echo "✓ Backend dependencies installed"
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend
npm install
echo "✓ Frontend dependencies installed"
echo ""

cd ..

echo "✅ Setup completed successfully!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "For Docker setup, run:"
echo "  docker-compose up"
