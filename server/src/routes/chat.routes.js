import express from 'express';
const router = express.Router();
import chatController from '../controllers/chat.controller.js';

// Create a new chat
router.post('/', chatController.createChat);
// Get all chats for a user
router.get('/', chatController.getUserChats);
