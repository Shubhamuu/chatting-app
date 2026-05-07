import express from 'express';

 import authRoutes from './auth.routes.js';
/*import chatRoutes from './chat.routes.js';
import messageRoutes from './message.routes.js'; */

const router = express.Router();

// route grouping
 router.use('/auth', authRoutes);
/*router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);   */

export default router;