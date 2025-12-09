# Online Coding Interview Application

A real-time collaborative coding interview platform that allows multiple users to edit code simultaneously, with syntax highlighting and code execution capabilities.

## Features

✅ **Real-time Collaboration**
- Multiple users can edit code simultaneously
- Live cursor position tracking
- Instant synchronization across all connected clients

✅ **Share Links**
- Generate unique room links
- Easy sharing with candidates
- One-click copy to clipboard

✅ **Syntax Highlighting**
- Support for JavaScript, Python, Java, C++, C#, and Ruby
- Powered by Ace Editor
- Code completion and suggestions

✅ **Code Execution**
- Execute code safely in the browser
- Real-time console output
- Support for multiple languages

✅ **Live Chat**
- Text-based communication
- System messages for user actions
- Message timestamps

✅ **User Management**
- Real-time participant list
- Online status indicators
- Join/leave notifications

## Architecture

### Backend
- **Framework**: Node.js with Express
- **Real-time Communication**: Socket.io for WebSocket support
- **API**: RESTful endpoints for session management

### Frontend
- **Framework**: React 18
- **Routing**: React Router
- **Code Editor**: React Ace (Ace Editor)
- **Real-time Client**: Socket.io Client
- **Styling**: CSS3 with responsive design

## Project Structure

```
coding-interview-app/
├── backend/
│   ├── server.js           # Main server file with Socket.io setup
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   └── Interview.jsx    # Main interview interface
│   │   ├── components/
│   │   │   ├── UserList.jsx     # Participant list
│   │   │   ├── Chat.jsx         # Chat interface
│   │   │   └── Console.jsx      # Code output console
│   │   ├── styles/              # CSS files
│   │   ├── App.jsx              # Main app component
│   │   └── index.js             # React entry point
│   ├── public/
│   │   └── index.html       # HTML template
│   └── package.json         # Frontend dependencies
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Setup

```bash
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app

# Install all dependencies
./setup.sh
```

### Start the Application

From the root directory, run:

```bash
npm run dev
```

This starts:
- ✅ Backend on `http://localhost:5000`
- ✅ Frontend on `http://localhost:3000`
- ✅ Both with hot-reload enabled

Both services run in the same terminal with color-coded output!

### Alternative: Manual Setup

**Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Frontend Setup (in another terminal):**
```bash
cd frontend
npm install
npm start
```

## Usage

1. **Start a Session**
   - Open `http://localhost:3000`
   - Click "Start Interview Session"
   - A unique room ID will be generated

2. **Share with Others**
   - Click "Copy Share Link" button
   - Send the link to candidates
   - They join with their name and start collaborating

3. **Collaborate**
   - Edit code in the editor in real-time
   - Change language from the dropdown
   - Click "Execute Code" to run JavaScript

   - Use the chat to communicate
   - View the participants list on the left

## API Documentation

### REST Endpoints

**Create a new session**
```
POST /api/sessions
Response:
{
  "roomId": "ABC123",
  "sessionId": "uuid-string",
  "shareLink": "http://localhost:3000/interview/ABC123"
}
```

**Get session details**
```
GET /api/sessions/:roomId
Response:
{
  "roomId": "ABC123",
  "code": "...",
  "language": "javascript",
  "users": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### WebSocket Events

**Client → Server:**
- `join-room`: Join a coding session
- `code-update`: Update code content
- `language-change`: Change programming language
- `execute-code`: Request code execution
- `chat-message`: Send a chat message
- `disconnect`: Leave the session

**Server → Client:**
- `session-state`: Receive current session state on join
- `code-update`: Broadcast code changes
- `language-change`: Broadcast language changes
- `user-joined`: Notify when user joins
- `user-left`: Notify when user leaves
- `chat-message`: Broadcast chat messages
- `code-executing`: Notify code execution start
- `execution-result`: Send code execution result
- `error`: Send error messages

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C#
- Ruby

## Security Considerations

1. **Input Validation**: All inputs are validated on the server
2. **CORS**: Configured to allow requests from frontend origin
3. **Room Isolation**: Each session is isolated
4. **Auto Cleanup**: Empty rooms are automatically cleaned up after 1 hour

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Code execution in secure sandboxes (using Docker/AWS Lambda)
- [ ] Code history and version control
- [ ] Audio/Video calling integration
- [ ] Code compilation error detection
- [ ] Performance metrics and analytics
- [ ] Database persistence for sessions
- [ ] Syntax error highlighting
- [ ] Smart autocomplete suggestions
- [ ] File upload and download

## Deployment

### Deploy Backend (Heroku/Railway)

```bash
cd backend
# Set environment variables in the platform
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)

```bash
cd frontend
# Update REACT_APP_SERVER_URL to your backend URL
npm run build
# Deploy the build folder
```

## Development

### Using Concurrently (Recommended)

```bash
# From root directory, run both services together
npm run dev
```

This is the easiest way - both services run in one terminal!

### Individual Services

```bash
# Backend only
cd backend
npm run dev

# Frontend only (in another terminal)
cd frontend
npm start
```

## Available Scripts

From root directory:

```bash
npm run dev          # Both services (with hot-reload) ⭐
npm start            # Both services (production mode)
npm run backend      # Backend only (production)
npm run backend:dev  # Backend only (development)
npm run frontend     # Frontend only
npm run build        # Build frontend for production
npm run docker       # Start with Docker Compose
```

## Troubleshooting

**CORS Error**: Make sure the `FRONTEND_URL` in backend `.env` matches your frontend URL.

**WebSocket Connection Error**: Check if backend is running and accessible from frontend.

**Code Won't Execute**: Only JavaScript is supported in the browser. Other languages require integration with Judge0 or Docker.

**Port Already in Use**: Change the port with `PORT=5001 npm run dev`

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
