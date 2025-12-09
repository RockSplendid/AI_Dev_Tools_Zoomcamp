# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js v16+ and npm
- Git

### Installation

```bash
# 1. Navigate to the app directory
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app

# 2. Run the automated setup script
chmod +x setup.sh
./setup.sh

# This will:
# - Create .env files
# - Install backend dependencies
# - Install frontend dependencies
```

## Starting the Application

### Method 1: Single Command (Recommended) ⭐

Run both backend and frontend simultaneously:

```bash
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000 (opens automatically)

Both will auto-reload on code changes.

### Method 2: Manual (Two Terminals)

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Expected output:
```
Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Expected output:
```
Compiled successfully!
On Your Network: http://localhost:3000
```

### Method 3: Docker

```bash
docker-compose up
```

Then open http://localhost:3000

### All Available Scripts

From the root directory:

```bash
npm run dev          # Run backend and frontend together (hot-reload)
npm start            # Run backend and frontend together (production)
npm run backend      # Backend only (production)
npm run backend:dev  # Backend only (development)
npm run frontend     # Frontend only
npm run build        # Build frontend for production
npm run docker       # Start with Docker Compose
```

## Using the Application

### Step 1: Create a Session
1. Open http://localhost:3000
2. Click "Start Interview Session"
3. A unique room ID will be generated

### Step 2: Share the Link
1. Click "Copy Share Link" button
2. Send the link to candidates/collaborators
3. They can open the link in their browsers

### Step 3: Start Collaborating

**Code Editing:**
- Both users can edit code simultaneously
- Changes appear in real-time
- Select language from dropdown

**Execute Code:**
- Click "Execute Code" button
- Output appears in the console
- Only JavaScript execution supported in browser (for now)

**Chat:**
- Use chat panel on the right
- Communicate with other participants
- System messages show join/leave events

**View Participants:**
- Left panel shows all connected users
- Green dot indicates active users
- Your name is marked with "(You)"

## Configuration

### Environment Variables

**Backend** (backend/.env):
```
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend** (frontend/.env):
```
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C#
- Ruby

*Note: Only JavaScript execution is fully functional in browser. For other languages, integrate with Judge0 API.*

## Features Overview

### ✅ Real-time Collaboration
- Live code editing
- Cursor position tracking
- Instant synchronization

### ✅ Code Execution
- Execute JavaScript code
- View output in console
- Error handling

### ✅ Communication
- Text chat
- System notifications
- User presence indicators

### ✅ User Management
- Participant list
- Join/leave notifications
- Online status

### ✅ Easy Sharing
- Copy-to-clipboard links
- Unique room IDs
- Direct URL sharing

## Troubleshooting

### Backend not starting
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill the process if needed
kill -9 <PID>

# Try a different port
PORT=5001 npm run dev
```

### Frontend connection error
- Ensure backend is running
- Check REACT_APP_SERVER_URL in frontend/.env
- Clear browser cache and refresh

### Code execution not working
- Only JavaScript is supported in browser
- Check browser console for errors
- Ensure code is syntactically correct

### WebSocket connection refused
- Check firewall settings
- Verify CORS configuration
- Ensure backend URL is correct

## Development Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev          # Start with hot-reload
npm start            # Start production
npm test             # Run tests (if configured)
```

### Frontend
```bash
npm install          # Install dependencies
npm start            # Start dev server
npm run build        # Create production build
npm test             # Run tests
```

## Project Structure

```
coding-interview-app/
├── backend/
│   ├── server.js              # Main server
│   ├── codeExecutor.js        # Code execution logic
│   ├── package.json           # Dependencies
│   └── .env.example           # Configuration template
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page
│   │   │   └── Interview.jsx  # Main interface
│   │   ├── components/
│   │   │   ├── UserList.jsx   # Participants
│   │   │   ├── Chat.jsx       # Chat panel
│   │   │   └── Console.jsx    # Output console
│   │   ├── utils/
│   │   │   ├── socketService.js
│   │   │   └── codeExecution.js
│   │   ├── styles/            # CSS files
│   │   ├── App.jsx            # Main component
│   │   └── index.js           # Entry point
│   ├── public/
│   │   └── index.html         # HTML template
│   └── package.json           # Dependencies
│
├── README.md                  # Full documentation
├── ARCHITECTURE.md            # Architecture details
├── DEPLOYMENT.md              # Deployment guide
├── docker-compose.yml         # Docker setup
├── Dockerfile.backend         # Backend Docker image
├── Dockerfile.frontend        # Frontend Docker image
└── setup.sh                   # Setup script
```

## Documentation Files

- **README.md** - Full feature documentation and setup guide
- **ARCHITECTURE.md** - System design and technical details
- **DEPLOYMENT.md** - Production deployment instructions
- **QUICK_START.md** - This file!

## Next Steps

1. ✅ Run `./setup.sh` to install dependencies
2. ✅ Start backend: `cd backend && npm run dev`
3. ✅ Start frontend: `cd frontend && npm start`
4. ✅ Open http://localhost:3000
5. ✅ Create a session and test with multiple browsers
6. ✅ Share the link with others

## Pro Tips

- Use different browser windows/tabs to test multi-user scenarios
- Press F12 to open DevTools and see real-time events
- Check Network tab to monitor WebSocket connections
- Use console.log() in your code to see output in the console panel

## Common Tasks

### Change port
```bash
# Backend
PORT=3001 npm run dev

# Frontend
PORT=3001 npm start
```

### Enable production mode
```bash
NODE_ENV=production npm start
```

### View live logs
```bash
# Backend
npm run dev

# Frontend
npm start
```

### Clear cache and reinstall
```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

1. Check the error message in browser console (F12)
2. Check server logs in backend terminal
3. Read the relevant documentation file:
   - Setup issues → README.md
   - Architecture questions → ARCHITECTURE.md
   - Deployment help → DEPLOYMENT.md
4. Verify environment variables are set correctly
5. Try restarting both backend and frontend

## Support & Feedback

For issues or feature requests, please:
1. Check existing documentation
2. Search previous issues
3. Create a new issue with detailed description
4. Include error logs and steps to reproduce

Happy coding! 🚀
