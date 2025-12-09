# Integration Tests Guide

## Overview

This project includes comprehensive integration tests that verify the interaction between the client (frontend) and server (backend).

## Test Setup

### Prerequisites

The test dependencies have been added to `backend/package.json`:
- `jest` - Test framework
- `socket.io-client` - Client for testing WebSocket connections
- `axios` - HTTP client for REST API testing

### Installation

The dependencies are already configured in `package.json`. To install them, run:

```bash
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app/backend
npm install
```

## Running Tests

### Run all integration tests:

```bash
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app/backend
npm test
```

### Run tests in watch mode (re-run on file changes):

```bash
npm run test:watch
```

## What Tests Cover

### 1. **REST API Endpoints**
   - `POST /api/sessions` - Create a new interview session
   - `GET /api/sessions/:id` - Retrieve session details
   - Error handling for non-existent sessions (404)

### 2. **WebSocket Events - User Connection**
   - User joins a room successfully
   - Multiple users can join the same room
   - User joined events are broadcast

### 3. **WebSocket Events - Code Updates**
   - Code changes are broadcast to other users in real-time
   - Language selection is communicated
   - Updates work across multiple connected clients

### 4. **WebSocket Events - Messages**
   - Chat messages are broadcast to all room participants
   - Message metadata (username, timestamp) is preserved
   - Messages reach all connected users

### 5. **WebSocket Events - Code Execution**
   - Code execution requests work end-to-end
   - Execution output is broadcast to all users
   - Status information is included in responses

## Test Structure

Each test follows this pattern:

1. **Setup**: Create a test session via REST API
2. **Connect**: Connect WebSocket clients to the test server
3. **Execute**: Perform the action being tested
4. **Verify**: Assert that expected events were received
5. **Cleanup**: Disconnect clients and clean up resources

## Example Test Run Output

```
✓ POST /api/sessions should create a new session (45ms)
✓ GET /api/sessions/:id should retrieve session (23ms)
✓ GET /api/sessions/:id should return 404 for non-existent session (18ms)
✓ User should join room and receive confirmation (120ms)
✓ Code updates should be broadcast (156ms)
✓ Messages should be broadcast to room (134ms)
✓ Code execution should work end-to-end (142ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

## Timeout Configuration

- Default test timeout: 10 seconds
- Socket connection timeout: 5 seconds
- HTTP request timeout: 5 seconds

These timeouts prevent tests from hanging indefinitely and help identify performance issues.

## Debugging Tests

To debug a specific test, modify the test file and use the Node.js debugger:

```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand __tests__/integration.test.js
```

Then open `chrome://inspect` in Google Chrome to debug.

## Adding New Tests

To add new integration tests:

1. Open `backend/__tests__/integration.test.js`
2. Add a new `test()` block within an appropriate `describe()` section
3. Follow the same pattern as existing tests
4. Use `axios` for REST API calls and `io()` for WebSocket connections
5. Always disconnect clients in cleanup code

Example:

```javascript
test('New feature should work correctly', (done) => {
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
        // Your test logic here
        socket.disconnect();
        clearTimeout(timeoutId);
        done();
      });
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      done(error);
    });
});
```

## CI/CD Integration

To integrate these tests with CI/CD pipelines, use the test command in your workflow:

```yaml
- name: Run Integration Tests
  run: |
    cd backend
    npm install
    npm test
```

## Troubleshooting

### Tests timing out
- Increase the timeout value in the test
- Check that the test server is starting properly
- Verify network connectivity

### Port already in use
- The tests use port 5001. Ensure it's available.
- Kill any existing processes: `lsof -i :5001` then `kill -9 <PID>`

### Module not found errors
- Run `npm install` in the backend directory
- Ensure all devDependencies are installed

### Socket connection failures
- Verify CORS is properly configured
- Check that the socket.io server is listening
- Ensure connection timeouts aren't too short

## Performance Notes

- Each test creates a new test server instance
- Tests are designed to run independently
- Total test suite runtime: ~1-2 seconds (depending on system performance)
- Parallel test execution is supported via Jest configuration

## Next Steps

1. Run `npm test` to verify all tests pass
2. Integrate tests into your development workflow
3. Add tests for new features as they're developed
4. Monitor test coverage as the project grows
