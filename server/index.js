import dotenv from 'dotenv';
import http from 'http';

import app from './src/app.js';
import connectDB from './src/config/db.js';
 import { initSocket } from './src/sockets/index.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    initSocket(server);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();