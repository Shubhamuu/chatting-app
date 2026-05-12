import express from 'express';
const router = express.Router();
import chatController from '../controllers/chat.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

// All routes here require authentication
router.use(authMiddleware);
// Create a new chat
router.post('/', chatController.createChat);
// Get all chats for a user
router.get('/', chatController.getUserChats);


export default router;