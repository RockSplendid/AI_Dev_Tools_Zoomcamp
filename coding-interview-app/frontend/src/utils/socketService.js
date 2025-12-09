import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (serverUrl = 'http://localhost:5000') => {
  if (!socket) {
    socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId, username) => {
  if (socket) {
    socket.emit('join-room', { roomId, username });
  }
};

export const updateCode = (roomId, code, cursorPosition = null) => {
  if (socket) {
    socket.emit('code-update', { roomId, code, cursorPosition });
  }
};

export const changeLanguage = (roomId, language) => {
  if (socket) {
    socket.emit('language-change', { roomId, language });
  }
};

export const executeCode = (roomId, code, language) => {
  if (socket) {
    socket.emit('execute-code', { roomId, code, language });
  }
};

export const sendMessage = (roomId, message, username) => {
  if (socket) {
    socket.emit('chat-message', { roomId, message, username });
  }
};
