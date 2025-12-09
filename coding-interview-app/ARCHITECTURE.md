# Architecture Documentation

## System Overview

The Online Coding Interview App is a real-time collaborative platform built with a client-server architecture using WebSocket communication for instant synchronization.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users' Browsers                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend Application (Port 3000)                   │   │
│  │  ├─ Home Page (Session Creation)                          │   │
│  │  ├─ Interview Page (Main Workspace)                       │   │
│  │  ├─ Code Editor (Ace Editor)                              │   │
│  │  ├─ User List Component                                   │   │
│  │  ├─ Chat Component                                        │   │
│  │  └─ Console Component                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│           │                                                       │
│           │ WebSocket (Socket.io)                                │
│           │ HTTP (RESTful API)                                   │
│           ↓                                                       │
└─────────────────────────────────────────────────────────────────┘
               │
               │
┌──────────────────────────────────────────────────────────────────┐
│  Express.js Server (Port 5000)                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ HTTP Routes     │  │ Socket.io       │  │ Room Manager     │  │
│  ├─────────────────┤  │ Event Handlers  │  ├──────────────────┤  │
│  │ POST /sessions  │  ├─────────────────┤  │ Session Storage  │  │
│  │ GET /sessions   │  │ join-room       │  │ User Tracking    │  │
│  │ /health         │  │ code-update     │  │ Cleanup Logic    │  │
│  └─────────────────┘  │ language-change │  └──────────────────┘  │
│                       │ execute-code    │                         │
│                       │ chat-message    │                         │
│                       │ disconnect      │                         │
│                       └─────────────────┘                         │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ In-Memory Data Store                                     │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │ rooms: Map<roomId, CodeSession>                          │    │
│  │   └─ CodeSession                                         │    │
│  │       ├─ id: string                                       │    │
│  │       ├─ roomId: string                                  │    │
│  │       ├─ code: string                                    │    │
│  │       ├─ language: string                                │    │
│  │       ├─ users: User[]                                   │    │
│  │       └─ createdAt: Date                                 │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App
├── Home
│   └── Create Session Button
└── Interview
    ├── UserList
    │   └── User items with status
    ├── CodeEditor
    │   ├── Language Selector
    │   ├── Ace Editor
    │   └── Execute Button
    ├── Console
    │   └── Output Display
    └── Chat
        ├── Message List
        └── Message Input
```

### Backend Structure

```
server.js
├── Express App Setup
├── Socket.io Configuration
├── REST Routes
│   ├── POST /api/sessions
│   ├── GET /api/sessions/:roomId
│   └── GET /health
├── WebSocket Events
│   ├── Connection Handlers
│   ├── Room Join/Leave
│   ├── Code Synchronization
│   ├── Language Management
│   ├── Code Execution
│   └── Messaging
├── Room Manager
│   └── CodeSession Class
└── Cleanup Tasks
    └── Auto-delete empty rooms
```

## Data Flow

### Session Creation Flow

```
1. User clicks "Start Interview Session"
   │
2. Frontend sends: POST /api/sessions
   │
3. Backend generates:
   ├─ roomId (6-char unique ID)
   ├─ sessionId (UUID)
   └─ Creates CodeSession instance
   │
4. Backend stores: rooms.set(roomId, session)
   │
5. Backend returns: { roomId, sessionId, shareLink }
   │
6. Frontend redirects: /interview/roomId
```

### Code Synchronization Flow

```
User A types code
    │
    ├─ socket.emit('code-update', {roomId, code})
    │
Backend receives event
    │
    ├─ Updates session.code
    │
    ├─ Broadcasts: socket.to(roomId).emit('code-update', {code})
    │
User B & C receive update
    │
    └─ setCode(newCode) updates editor
```

### Real-time Chat Flow

```
User sends message
    │
    ├─ socket.emit('chat-message', {roomId, message, username})
    │
Backend receives event
    │
    ├─ io.to(roomId).emit('chat-message', {...})
    │
All users in room receive message
    │
    └─ Messages displayed in chat component
```

### Execution Flow

```
User clicks "Execute Code"
    │
    ├─ socket.emit('execute-code', {roomId, code, language})
    │
Backend receives event
    │
    ├─ All users notified: 'code-executing'
    │
    ├─ Backend executes code (via Judge0, Docker, or Node.js)
    │
    ├─ socket.emit('execution-result', {output, error})
    │
All users receive results
    │
    └─ Output displayed in console
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Socket.io Client**: Real-time communication
- **Ace Editor (React Ace)**: Code editing with syntax highlighting
- **CSS3**: Styling and animations
- **Axios**: HTTP client (optional, for REST calls)

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.io**: WebSocket library
- **UUID**: Session ID generation
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment configuration

### Optional Integrations
- **MongoDB/PostgreSQL**: Data persistence
- **Docker**: Containerization
- **Nginx**: Reverse proxy and load balancing
- **Redis**: Session management and caching
- **Judge0 API**: Multi-language code execution
- **AWS Lambda**: Serverless code execution

## Communication Protocols

### HTTP/REST API

**Create Session**
```
Request:  POST /api/sessions
Response: 
{
  "roomId": "ABC123",
  "sessionId": "uuid",
  "shareLink": "http://localhost:3000/interview/ABC123"
}
Status: 201 Created
```

**Get Session**
```
Request:  GET /api/sessions/ABC123
Response:
{
  "roomId": "ABC123",
  "code": "...",
  "language": "javascript",
  "users": [...],
  "createdAt": "2024-01-01T00:00:00Z"
}
Status: 200 OK
```

### WebSocket Events

#### Client → Server

```javascript
// Join a room
socket.emit('join-room', {
  roomId: 'ABC123',
  username: 'John Doe'
});

// Update code
socket.emit('code-update', {
  roomId: 'ABC123',
  code: 'console.log("hello");',
  cursorPosition: { row: 0, column: 5 }
});

// Change language
socket.emit('language-change', {
  roomId: 'ABC123',
  language: 'python'
});

// Execute code
socket.emit('execute-code', {
  roomId: 'ABC123',
  code: 'print("hello")',
  language: 'python'
});

// Send message
socket.emit('chat-message', {
  roomId: 'ABC123',
  message: 'Hello everyone!',
  username: 'John Doe'
});
```

#### Server → Client

```javascript
// Session state on join
socket.on('session-state', {
  code: '...',
  language: 'javascript',
  users: [...]
});

// Code update broadcast
socket.on('code-update', {
  code: '...',
  userId: 'socket-id',
  cursorPosition: {...}
});

// User joined
socket.on('user-joined', {
  userId: 'socket-id',
  username: 'Jane Doe',
  users: [...]
});

// User left
socket.on('user-left', {
  userId: 'socket-id',
  username: 'Jane Doe',
  users: [...]
});

// Chat message
socket.on('chat-message', {
  userId: 'socket-id',
  username: 'John Doe',
  message: 'Hello!',
  timestamp: '2024-01-01T12:00:00Z'
});

// Execution result
socket.on('execution-result', {
  output: 'Code output...',
  language: 'javascript'
});

// Error
socket.on('error', {
  message: 'Error message'
});
```

## Scalability Considerations

### Current Limitations
- In-memory storage (not persistent)
- Single server instance
- No database integration
- No session persistence

### Scaling Strategies

1. **Database Persistence**
   - Store sessions in MongoDB/PostgreSQL
   - Track user activity and history

2. **Distributed Architecture**
   - Use Redis for pub/sub across multiple servers
   - Load balance with Nginx

3. **Microservices**
   - Separate code execution service
   - Separate authentication service
   - Separate analytics service

4. **Code Execution**
   - Integrate Judge0 API for multi-language support
   - Use Docker containers for isolation
   - Implement execution queuing system

## Security Considerations

### Current Security Measures
- Input validation on server
- CORS configuration
- Room isolation
- Auto-cleanup of empty sessions

### Recommended Enhancements
1. **Authentication**
   - JWT-based authentication
   - OAuth integration
   - Rate limiting

2. **Code Execution Safety**
   - Sandboxed execution environment
   - Resource limits (memory, CPU, time)
   - Code review before execution

3. **Data Protection**
   - SSL/TLS encryption
   - Secure WebSocket (WSS)
   - Data encryption at rest

4. **Access Control**
   - User roles and permissions
   - Session ownership verification
   - Audit logging

## Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Debounced code updates (300ms)
- Virtual scrolling for large chat
- CSS animations with GPU acceleration

### Backend Optimization
- Event debouncing
- Memory pooling
- Session cleanup scheduling
- Connection pooling for databases

## Error Handling

### Client-Side Errors
- WebSocket connection failures
- Timeout handling
- Code execution errors
- User-friendly error messages

### Server-Side Errors
- Invalid room IDs
- Malformed data
- Execution timeouts
- Network failures

## Testing Strategy

### Unit Tests
- CodeSession class methods
- Utility functions
- Component rendering

### Integration Tests
- WebSocket communication
- Session lifecycle
- Code synchronization

### End-to-End Tests
- Full user journey
- Multi-user scenarios
- Error recovery

## Monitoring and Debugging

### Frontend Monitoring
- Console logs
- React DevTools
- Network requests (DevTools)
- Performance metrics

### Backend Monitoring
- PM2 monitoring
- Server logs
- Socket.io event tracking
- Performance profiling

## Future Enhancements

1. **Advanced Features**
   - Audio/video calls (WebRTC)
   - Screen sharing
   - Code templates and presets
   - Syntax error detection

2. **Integrations**
   - GitHub integration
   - IDE integrations
   - Slack notifications
   - Analytics dashboards

3. **Performance**
   - Service workers for offline support
   - WebAssembly for code execution
   - GraphQL API
   - Caching strategies

4. **User Experience**
   - Dark mode
   - Custom themes
   - Keyboard shortcuts
   - Accessibility improvements
