import { io } from 'socket.io-client';

const BASE_URL = 'https://mental-health-app-1-a5qo.onrender.com';

let socket = null;

// Lazily creates a single shared socket connection, authenticated the same
// way the backend expects: a JWT passed in the handshake's `auth` payload
// (see backend/src/chatSocket.js — io.use reads socket.handshake.auth.token).
export function getSocket() {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem('mindspace_token');
  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
