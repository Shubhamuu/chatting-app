import User from '../models/user.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const createChat = async (participants) => {
    try {
    const chat = new Conversation({ participants });
    await chat.save();
    return chat;
    } catch (error) {
        throw new Error('Chat creation failed: ' + error.message);
    }

}

export const getUserChats = async (
  userId,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit;

    const [chats, totalChats] = await Promise.all([
Conversation.find({
  participants: userId,
})
  .populate("participants", "name email")
  .populate({
    path: "lastMessage",
    populate: {
      path: "sender",
      select: "name",
    },
  })
  .sort({ lastActivity: -1 })
  .skip(skip)
  .limit(limit),
      Conversation.countDocuments({
        participants: userId,
      }),
    ]);

    return {
      chats,
      totalChats,
      currentPage: page,
      totalPages: Math.ceil(totalChats / limit),
      hasNextPage: page * limit < totalChats,
    };

  } catch (error) {
    throw new Error(
      "Failed to fetch user chats: " + error.message
    );
  }
};

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

