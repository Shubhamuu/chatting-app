import User from '../models/user.js';
import Chat from '../models/chat.js';
import Message from '../models/message.js';

export const createChat = async (participants) => {
    try {
    const chat = new Chat({ participants });
    await chat.save();
    return chat;
    } catch (error) {
        throw new Error('Chat creation failed: ' + error.message);
    }

}

export const getUserChats = async (userId) => {
    try {
        const chats = await Chat.find({ participants: userId }).populate('participants', 'name email');
        return chats;
    } catch (error) {
        throw new Error('Failed to fetch user chats: ' + error.message);
    }
}

export const sendMessage = async (chatId, senderId, content) => {
    try {
        const message = new Message({ chat: chatId, sender: senderId, content });   
        await message.save();
        return message;
    }
    catch (error) {
        throw new Error('Message sending failed: ' + error.message);
    }
}

export const getFriendsList = async (userId) => {
    try {
        const users = await User.find({})
      .select('_id name');

      return users;
    } catch (error) {
        throw new Error('Failed to fetch friends list: ' + error.message);
    }
}

