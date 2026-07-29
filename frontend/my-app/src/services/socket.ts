import { io } from 'socket.io-client';

export const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
});

export default socket;