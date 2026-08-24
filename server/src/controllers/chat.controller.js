import * as chatService from '../services/chat.service.js';
import { getIO } from '../sockets/index.js';
export const createChat = async (req, res) => {
    try {
        const { chatId, participants } = req.body;
        if (!chatId || !participants || participants.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID and at least 2 participants are required',
            });
        }
        // Here you would typically save the chat to the database
        const chat = await chatService.createChat(participants);

        res.status(201).json({
            success: true,
            chat: { chatId, participants },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message,
        });
    }
};
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = Number(req.query.page) || 1;
    console.log('Fetching chats for user', userId, 'page:', page, 'limit:',req.query.limit);
    const limit = Number(req.query.limit) || 10;

    const result = await chatService.getUserChats(
      userId,
      page,
      limit
    );

    res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;
        const senderId = req.user._id;
        if (!chatId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID and message content are required',
            });
        }
        const message = await chatService.sendMessage(chatId, senderId, content);
        
        const messageWithSender = {
            ...message.toObject(),
            sender: {
                _id: req.user._id,
                name: req.user.name,
            }
        };

        const io = getIO();
        io.to(chatId).emit('receive_message', messageWithSender);

        res.status(201).json({
            success: true,
            message: messageWithSender,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID is required',
            });
        }

        const messages = await chatService.getChatMessages(chatId, page, limit);

        return res.json({
            success: true,
            messages,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export default {
    createChat,
    getUserChats,
    sendMessage,
    getChatMessages,
};