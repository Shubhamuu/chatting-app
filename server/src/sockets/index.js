import { Server } from 'socket.io';

//import chatSocket from './chat.socket.js';
//import callSocket from './call.socket.js';


/* export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // restrict in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // OPTIONAL: attach userId (from auth middleware or handshake)


    // Join personal room
    if (userId) {
      socket.join(userId);
    }

    // Register feature sockets
    chatSocket(io, socket);
    callSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}; */
export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // restrict in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // OPTIONAL: attach userId (from auth middleware or handshake)


    // Join personal room
   
      socket.on("message", (data) => {
        io.emit("message", data);
      });

    // Register feature sockets
    

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};
// optional getter (useful in services if needed)
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};