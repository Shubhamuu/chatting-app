import * as chatService from '../services/chat.service.js';
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
        const chats = await chatService.getUserChats(userId);

        res.json({
            success: true,
            chats,
        });
    }
    catch (error) {
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
        res.status(201).json({
            success: true,
            message,
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
};