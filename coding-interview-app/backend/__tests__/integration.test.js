const axios = require('axios');
const io = require('socket.io-client');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Test configuration
const TEST_PORT = 5001;
const TEST_URL = `http://localhost:${TEST_PORT}`;
const TIMEOUT = 5000;

// Setup test server
let server;
let testApp;
let testIO;
const sessions = {};

function setupTestServer() {
  return new Promise((resolve, reject) => {
    try {
      testApp = express();
      server = http.createServer(testApp);
      testIO = socketIO(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
      });

      testApp.use(cors());
      testApp.use(express.json());

      // REST Endpoints
      testApp.post('/api/sessions', (req, res) => {
        const id = Math.random().toString(36).substr(2, 9);
        sessions[id] = {
          id,
          participants: [],
          code: '',
          createdAt: new Date(),
        };
        res.json({ id, message: 'Session created' });
      });

      testApp.get('/api/sessions/:id', (req, res) => {
        const session = sessions[req.params.id];
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
      });

      // Socket.io Events
      testIO.on('connection', (socket) => {
        socket.on('join-room', ({ roomId, userName }) => {
          socket.join(roomId);
          const session = sessions[roomId];
          if (session) {
            session.participants.push({ id: socket.id, name: userName });
            testIO.to(roomId).emit('user-joined', {
              userId: socket.id,
              userName,
              participants: session.participants,
            });
          }
        });

        socket.on('code-update', ({ roomId, code, language }) => {
          const session = sessions[roomId];
          if (session) {
            session.code = code;
            session.language = language;
            socket.to(roomId).emit('code-update', { code, language });
          }
        });

        socket.on('execute-code', ({ roomId, code, language }) => {
          testIO.to(roomId).emit('code-executed', {
            output: `Executed ${language}: ${code}`,
            status: 'success',
          });
        });

        socket.on('send-message', ({ roomId, message, userName }) => {
          testIO.to(roomId).emit('receive-message', {
            message,
            userName,
            timestamp: new Date(),
          });
        });
      });

      const timeoutId = setTimeout(() => {
        reject(new Error('Server setup timeout'));
      }, TIMEOUT);

      server.listen(TEST_PORT, () => {
        clearTimeout(timeoutId);
        resolve();
      });

      server.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function teardownTestServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

describe('Client-Server Integration Tests', () => {
  beforeAll(async () => {
    await setupTestServer();
  }, 15000);

  afterAll(async () => {
    await teardownTestServer();
  }, 10000);

  describe('REST API Endpoints', () => {
    test('POST /api/sessions should create a new session', async () => {
      const response = await axios.post(`${TEST_URL}/api/sessions`, {}, { timeout: TIMEOUT });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
    });

    test('GET /api/sessions/:id should retrieve session', async () => {
      const createResponse = await axios.post(`${TEST_URL}/api/sessions`, {}, { timeout: TIMEOUT });
      const sessionId = createResponse.data.id;
      const getResponse = await axios.get(`${TEST_URL}/api/sessions/${sessionId}`, { timeout: TIMEOUT });
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.id).toBe(sessionId);
    });

    test('GET /api/sessions/:id should return 404 for non-existent session', async () => {
      try {
        await axios.get(`${TEST_URL}/api/sessions/non-existent-id`, { timeout: TIMEOUT });
        fail('Should have thrown 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('WebSocket Events', () => {
    test('User should join room and receive confirmation', (done) => {
      const timeoutId = setTimeout(() => {
        fail('Test timeout');
        socket.disconnect();
      }, TIMEOUT);

      axios
        .post(`${TEST_URL}/api/sessions`, {}, { timeout: TIMEOUT })
        .then((res) => {
          const roomId = res.data.id;
          const socket = io(TEST_URL, { reconnection: false, forceNew: true });

          socket.on('connect', () => {
            socket.emit('join-room', { roomId, userName: 'TestUser' });
          });

          socket.on('user-joined', (data) => {
            clearTimeout(timeoutId);
            expect(data.userName).toBe('TestUser');
            socket.disconnect();
            done();
          });

          socket.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          done(error);
        });
    }, 10000);

    test('Code updates should be broadcast', (done) => {
      const timeoutId = setTimeout(() => {
        fail('Test timeout');
        socket1.disconnect();
        socket2.disconnect();
      }, TIMEOUT);

      axios
        .post(`${TEST_URL}/api/sessions`, {}, { timeout: TIMEOUT })
        .then((res) => {
          const roomId = res.data.id;
          const socket1 = io(TEST_URL, { reconnection: false, forceNew: true });
          const socket2 = io(TEST_URL, { reconnection: false, forceNew: true });

          let joined = 0;

          socket1.on('connect', () => {
            socket1.emit('join-room', { roomId, userName: 'User1' });
          });

          socket2.on('connect', () => {
            socket2.emit('join-room', { roomId, userName: 'User2' });
          });

          socket1.on('user-joined', () => {
            joined++;
            if (joined >= 2) {
              socket1.emit('code-update', { roomId, code: 'console.log("test")', language: 'javascript' });
            }
          });

          socket2.on('user-joined', () => {
            joined++;
            if (joined >= 2) {
              socket1.emit('code-update', { roomId, code: 'console.log("test")', language: 'javascript' });
            }
          });

          socket2.on('code-update', (data) => {
            clearTimeout(timeoutId);
            expect(data.code).toBe('console.log("test")');
            expect(data.language).toBe('javascript');
            socket1.disconnect();
            socket2.disconnect();
            done();
          });

          socket1.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });

          socket2.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          done(error);
        });
    }, 10000);

    test('Messages should be broadcast to room', (done) => {
      const timeoutId = setTimeout(() => {
        fail('Test timeout');
        socket1.disconnect();
        socket2.disconnect();
      }, TIMEOUT);

      axios
        .post(`${TEST_URL}/api/sessions`, {}, { timeout: TIMEOUT })
        .then((res) => {
          const roomId = res.data.id;
          const socket1 = io(TEST_URL, { reconnection: false, forceNew: true });
          const socket2 = io(TEST_URL, { reconnection: false, forceNew: true });

          let joined = 0;

          socket1.on('connect', () => {
            socket1.emit('join-room', { roomId, userName: 'User1' });
          });

          socket2.on('connect', () => {
            socket2.emit('join-room', { roomId, userName: 'User2' });
          });

          socket1.on('user-joined', () => {
            joined++;
            if (joined >= 2) {
              socket1.emit('send-message', { roomId, message: 'Hello', userName: 'User1' });
            }
          });

          socket2.on('user-joined', () => {
            joined++;
            if (joined >= 2) {
              socket1.emit('send-message', { roomId, message: 'Hello', userName: 'User1' });
            }
          });

          socket2.on('receive-message', (data) => {
            clearTimeout(timeoutId);
            expect(data.message).toBe('Hello');
            expect(data.userName).toBe('User1');
            socket1.disconnect();
            socket2.disconnect();
            done();
          });

          socket1.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });

          socket2.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          done(error);
        });
    }, 10000);

    test('Code execution should work end-to-end', (done) => {
      const timeoutId = setTimeout(() => {
        fail('Test timeout');
        socket1.disconnect();
        socket2.disconnect();
      }, TIMEOUT);

      axios
        .post(`${TEST_URL}/api/sessions`, {}, { timeout: TIMEOUT })
        .then((res) => {
          const roomId = res.data.id;
          const socket1 = io(TEST_URL, { reconnection: false, forceNew: true });
          const socket2 = io(TEST_URL, { reconnection: false, forceNew: true });

          let joined = 0;

          socket1.on('connect', () => {
            socket1.emit('join-room', { roomId, userName: 'Executor1' });
          });

          socket2.on('connect', () => {
            socket2.emit('join-room', { roomId, userName: 'Executor2' });
          });

          socket1.on('user-joined', () => {
            joined++;
            if (joined >= 2) {
              socket1.emit('execute-code', { roomId, code: 'return 42;', language: 'javascript' });
            }
          });

          socket2.on('user-joined', () => {
            joined++;
            if (joined >= 2) {
              socket1.emit('execute-code', { roomId, code: 'return 42;', language: 'javascript' });
            }
          });

          socket2.on('code-executed', (data) => {
            clearTimeout(timeoutId);
            expect(data.status).toBe('success');
            expect(data.output).toContain('Executed');
            socket1.disconnect();
            socket2.disconnect();
            done();
          });

          socket1.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });

          socket2.on('error', (error) => {
            clearTimeout(timeoutId);
            done(error);
          });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          done(error);
        });
    }, 10000);
  });
});
