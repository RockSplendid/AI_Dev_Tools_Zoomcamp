require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Store rooms and their sessions
const rooms = new Map();

// Helper function to generate short room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Session/Room model
class CodeSession {
  constructor(id, roomId) {
    this.id = id;
    this.roomId = roomId;
    this.code = '// Start coding here\n';
    this.language = 'javascript';
    this.users = [];
    this.createdAt = new Date();
  }

  addUser(userId, username) {
    this.users.push({ userId, username, joinedAt: new Date() });
  }

  removeUser(userId) {
    this.users = this.users.filter(u => u.userId !== userId);
  }

  updateCode(code) {
    this.code = code;
  }

  updateLanguage(language) {
    this.language = language;
  }
}

// REST Routes

// Create a new session
app.post('/api/sessions', (req, res) => {
  const roomId = generateRoomId();
  const sessionId = uuidv4();
  const session = new CodeSession(sessionId, roomId);
  
  rooms.set(roomId, session);
  
  res.json({
    roomId,
    sessionId,
    shareLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/${roomId}`
  });
});

// Get session details
app.get('/api/sessions/:roomId', (req, res) => {
  const { roomId } = req.params;
  const session = rooms.get(roomId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    roomId,
    code: session.code,
    language: session.language,
    users: session.users,
    createdAt: session.createdAt
  });
});

// WebSocket Events

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    const session = rooms.get(roomId);

    if (!session) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    socket.join(roomId);
    const userId = socket.id;
    session.addUser(userId, username);

    // Notify others
    io.to(roomId).emit('user-joined', {
      userId,
      username,
      users: session.users
    });

    // Send current session state to the user
    socket.emit('session-state', {
      code: session.code,
      language: session.language,
      users: session.users
    });

    console.log(`${username} joined room ${roomId}`);
  });

  // Code update
  socket.on('code-update', (data) => {
    const { roomId, code, cursorPosition } = data;
    const session = rooms.get(roomId);

    if (!session) return;

    session.updateCode(code);

    // Broadcast to all users in the room except sender
    socket.to(roomId).emit('code-update', {
      code,
      userId: socket.id,
      cursorPosition
    });
  });

  // Language change
  socket.on('language-change', (data) => {
    const { roomId, language } = data;
    const session = rooms.get(roomId);

    if (!session) return;

    session.updateLanguage(language);

    // Broadcast to all users in the room
    io.to(roomId).emit('language-change', { language });
  });

  // Execute code (now handled in browser via WASM)
  socket.on('code-executed', (data) => {
    const { roomId, output, error, language, executedBy } = data;

    // Broadcast execution result to all users in the room
    io.to(roomId).emit('code-executed', {
      userId: socket.id,
      executedBy,
      output,
      error,
      language,
      timestamp: new Date()
    });

    console.log(`Code executed in room ${roomId} by ${executedBy} (${language})`);
  });

  // Chat message
  socket.on('chat-message', (data) => {
    const { roomId, message, username } = data;

    io.to(roomId).emit('chat-message', {
      userId: socket.id,
      username,
      message,
      timestamp: new Date()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from all rooms
    for (const [roomId, session] of rooms.entries()) {
      const user = session.users.find(u => u.userId === socket.id);
      if (user) {
        session.removeUser(socket.id);
        io.to(roomId).emit('user-left', {
          userId: socket.id,
          username: user.username,
          users: session.users
        });

        // Delete empty rooms after 1 hour
        if (session.users.length === 0) {
          setTimeout(() => {
            if (session.users.length === 0) {
              rooms.delete(roomId);
            }
          }, 3600000);
        }
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Catch-all handler for React Router (must be after all API routes)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
