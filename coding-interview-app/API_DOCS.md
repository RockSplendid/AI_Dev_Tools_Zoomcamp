# API Documentation

## Overview

The Online Coding Interview App uses both REST and WebSocket APIs for communication.

## REST API

### Base URL
- Development: `http://localhost:5000`
- Production: `https://api.example.com`

### Authentication
Currently, no authentication is required. Future versions will support:
- JWT tokens
- API keys
- OAuth 2.0

---

## REST Endpoints

### 1. Create a New Session

**Endpoint:** `POST /api/sessions`

**Description:** Creates a new interview session with a unique room ID.

**Request:**
```json
{}
```

**Response:** `201 Created`
```json
{
  "roomId": "ABC123",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "shareLink": "http://localhost:3000/interview/ABC123"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/sessions
```

---

### 2. Get Session Details

**Endpoint:** `GET /api/sessions/:roomId`

**Description:** Retrieves current session information including code, language, and participants.

**Parameters:**
- `roomId` (path, required): The room ID

**Response:** `200 OK`
```json
{
  "roomId": "ABC123",
  "code": "console.log('Hello, World!');",
  "language": "javascript",
  "users": [
    {
      "userId": "socket-id-1",
      "username": "John Doe",
      "joinedAt": "2024-01-01T12:00:00.000Z"
    },
    {
      "userId": "socket-id-2",
      "username": "Jane Smith",
      "joinedAt": "2024-01-01T12:05:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:5000/api/sessions/ABC123
```

---

### 3. Health Check

**Endpoint:** `GET /health`

**Description:** Checks if the server is running and healthy.

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:5000/health
```

---

## WebSocket API

### Connection

**URL:** `http://localhost:5000` (Socket.io)

**Example:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

## WebSocket Events

### Client → Server Events

#### 1. Join Room

**Event:** `join-room`

**Description:** Join a specific interview session.

**Payload:**
```json
{
  "roomId": "ABC123",
  "username": "John Doe"
}
```

**Example:**
```javascript
socket.emit('join-room', {
  roomId: 'ABC123',
  username: 'John Doe'
});
```

---

#### 2. Code Update

**Event:** `code-update`

**Description:** Update the code content. Changes are broadcast to all users.

**Payload:**
```json
{
  "roomId": "ABC123",
  "code": "console.log('Hello, World!');",
  "cursorPosition": {
    "row": 0,
    "column": 10
  }
}
```

**Example:**
```javascript
socket.emit('code-update', {
  roomId: 'ABC123',
  code: "console.log('Hello, World!');",
  cursorPosition: { row: 0, column: 10 }
});
```

**Notes:**
- Updates are debounced (300ms) to reduce network traffic
- Cursor position is optional

---

#### 3. Language Change

**Event:** `language-change`

**Description:** Change the programming language for syntax highlighting.

**Payload:**
```json
{
  "roomId": "ABC123",
  "language": "python"
}
```

**Supported Languages:**
- `javascript`
- `python`
- `java`
- `cpp`
- `csharp`
- `ruby`

**Example:**
```javascript
socket.emit('language-change', {
  roomId: 'ABC123',
  language: 'python'
});
```

---

#### 4. Execute Code

**Event:** `execute-code`

**Description:** Execute the current code and get output.

**Payload:**
```json
{
  "roomId": "ABC123",
  "code": "console.log('Hello');",
  "language": "javascript"
}
```

**Example:**
```javascript
socket.emit('execute-code', {
  roomId: 'ABC123',
  code: "console.log('Hello');",
  language: 'javascript'
});
```

**Notes:**
- Currently only JavaScript execution is supported
- Execution time limit: 5 seconds
- Max output size: 10KB

---

#### 5. Chat Message

**Event:** `chat-message`

**Description:** Send a message to all participants in the room.

**Payload:**
```json
{
  "roomId": "ABC123",
  "message": "Great work everyone!",
  "username": "John Doe"
}
```

**Example:**
```javascript
socket.emit('chat-message', {
  roomId: 'ABC123',
  message: 'Great work everyone!',
  username: 'John Doe'
});
```

---

### Server → Client Events

#### 1. Session State

**Event:** `session-state`

**Description:** Sent when a user joins. Contains current session data.

**Payload:**
```json
{
  "code": "console.log('Hello');",
  "language": "javascript",
  "users": [
    {
      "userId": "socket-id-1",
      "username": "John Doe",
      "joinedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

**Listener:**
```javascript
socket.on('session-state', (data) => {
  console.log('Current code:', data.code);
  console.log('Current users:', data.users);
});
```

---

#### 2. Code Update

**Event:** `code-update`

**Description:** Broadcast when another user updates the code.

**Payload:**
```json
{
  "code": "console.log('Updated');",
  "userId": "socket-id-2",
  "cursorPosition": {
    "row": 0,
    "column": 15
  }
}
```

**Listener:**
```javascript
socket.on('code-update', (data) => {
  setCode(data.code);
});
```

---

#### 3. Language Change

**Event:** `language-change`

**Description:** Broadcast when the language is changed.

**Payload:**
```json
{
  "language": "python"
}
```

**Listener:**
```javascript
socket.on('language-change', (data) => {
  setLanguage(data.language);
});
```

---

#### 4. User Joined

**Event:** `user-joined`

**Description:** Broadcast when a new user joins the session.

**Payload:**
```json
{
  "userId": "socket-id-2",
  "username": "Jane Smith",
  "users": [
    {
      "userId": "socket-id-1",
      "username": "John Doe",
      "joinedAt": "2024-01-01T12:00:00.000Z"
    },
    {
      "userId": "socket-id-2",
      "username": "Jane Smith",
      "joinedAt": "2024-01-01T12:05:00.000Z"
    }
  ]
}
```

**Listener:**
```javascript
socket.on('user-joined', (data) => {
  console.log(`${data.username} joined`);
  setUsers(data.users);
});
```

---

#### 5. User Left

**Event:** `user-left`

**Description:** Broadcast when a user leaves the session.

**Payload:**
```json
{
  "userId": "socket-id-2",
  "username": "Jane Smith",
  "users": [
    {
      "userId": "socket-id-1",
      "username": "John Doe",
      "joinedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

**Listener:**
```javascript
socket.on('user-left', (data) => {
  console.log(`${data.username} left`);
  setUsers(data.users);
});
```

---

#### 6. Chat Message

**Event:** `chat-message`

**Description:** Broadcast when a user sends a message.

**Payload:**
```json
{
  "userId": "socket-id-1",
  "username": "John Doe",
  "message": "Great work!",
  "timestamp": "2024-01-01T12:10:00.000Z"
}
```

**Listener:**
```javascript
socket.on('chat-message', (data) => {
  console.log(`${data.username}: ${data.message}`);
});
```

---

#### 7. Code Executing

**Event:** `code-executing`

**Description:** Sent when code execution starts.

**Payload:**
```json
{
  "userId": "socket-id-1",
  "language": "javascript"
}
```

**Listener:**
```javascript
socket.on('code-executing', (data) => {
  console.log('Code is executing...');
});
```

---

#### 8. Execution Result

**Event:** `execution-result`

**Description:** Sent with the code execution result.

**Payload:**
```json
{
  "output": "Hello, World!\nExecution complete",
  "language": "javascript"
}
```

**Listener:**
```javascript
socket.on('execution-result', (data) => {
  console.log('Output:', data.output);
});
```

---

#### 9. Error

**Event:** `error`

**Description:** Sent when an error occurs.

**Payload:**
```json
{
  "message": "Room not found"
}
```

**Listener:**
```javascript
socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

---

## Error Handling

### HTTP Errors

**404 Not Found**
```json
{
  "error": "Session not found"
}
```

**400 Bad Request**
```json
{
  "error": "Invalid request parameters"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

### WebSocket Errors

**Example Error Handling:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('error', (data) => {
  console.error('Event error:', data.message);
});

socket.on('disconnect', (reason) => {
  console.warn('Disconnected:', reason);
});
```

---

## Rate Limiting

**Planned for Future:**
- 100 requests per minute per IP (HTTP)
- Debounced WebSocket events (300ms for code updates)

---

## CORS Configuration

**Allowed Origins:**
- `http://localhost:3000` (development)
- Configured via `FRONTEND_URL` environment variable

**Allowed Methods:**
- GET
- POST
- PUT
- DELETE

**Allowed Headers:**
- Content-Type
- Authorization

---

## WebSocket Reconnection

**Automatic Reconnection:**
- Enabled by default
- Initial delay: 1000ms
- Max delay: 5000ms
- Max attempts: 5

**Configuration:**
```javascript
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

---

## Code Examples

### JavaScript Client

```javascript
import io from 'socket.io-client';

// Connect to server
const socket = io('http://localhost:5000');

// Join a room
socket.emit('join-room', {
  roomId: 'ABC123',
  username: 'John Doe'
});

// Listen for session state
socket.on('session-state', (data) => {
  console.log('Session code:', data.code);
});

// Update code
socket.emit('code-update', {
  roomId: 'ABC123',
  code: 'console.log("test");'
});

// Listen for code updates
socket.on('code-update', (data) => {
  console.log('Code updated:', data.code);
});

// Execute code
socket.emit('execute-code', {
  roomId: 'ABC123',
  code: 'console.log("hello");',
  language: 'javascript'
});

// Listen for results
socket.on('execution-result', (data) => {
  console.log('Output:', data.output);
});

// Send message
socket.emit('chat-message', {
  roomId: 'ABC123',
  message: 'Hello everyone!',
  username: 'John Doe'
});

// Listen for messages
socket.on('chat-message', (data) => {
  console.log(`${data.username}: ${data.message}`);
});
```

### cURL Examples

```bash
# Create session
curl -X POST http://localhost:5000/api/sessions

# Get session
curl http://localhost:5000/api/sessions/ABC123

# Health check
curl http://localhost:5000/health
```

---

## Versioning

Current API Version: **v1.0**

Future versions may include:
- Versioned endpoints (`/api/v2/...`)
- Deprecation notices
- Migration guides

---

## Changelog

### v1.0 (Current)
- ✅ REST API for session management
- ✅ WebSocket for real-time collaboration
- ✅ Code execution (JavaScript)
- ✅ Chat messaging
- ✅ User presence

### v1.1 (Planned)
- Multi-language code execution
- User authentication
- Session persistence
- Code history/versioning

### v2.0 (Future)
- GraphQL API
- Audio/video streaming
- Advanced analytics
- Integration marketplace

---

## Support

For API questions or issues:
1. Check this documentation
2. Review code examples
3. Check GitHub issues
4. Create a new issue with:
   - Endpoint/event used
   - Payload sent
   - Error received
   - Steps to reproduce
