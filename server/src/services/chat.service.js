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
// update to delivered
    await Message.updateMany(
      { conversationId: { $in: chats.map((c) => c._id) }, sender: { $ne: userId }, status: 'sent' },
      { $set: { status: 'delivered' } }
    );
    
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
      const message = await new Message({ conversationId: chatId, sender: senderId, content: content, messageType: "text", updatedAt: new Date(), createdAt: new Date()  }).save();
         
        const conversation = await Conversation.findById(chatId);
        if (!conversation) {
            throw new Error('Chat not found');
        }
        conversation.lastMessage = message._id;
        conversation.lastActivity = new Date();
        await conversation.save();
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
export const getChatMessages = async (chatId, page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;
        const messages = await Message.find({ conversationId: chatId })
            .populate('sender', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalMessages = await Message.countDocuments({ conversationId: chatId });
        // update messages to seen
        await Message.updateMany(
            { conversationId: chatId, status: 'sent' },
            { $set: { status: 'seen' } }
        );


        return {
            messages,
            totalMessages,
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            hasNextPage: page * limit < totalMessages,  
        }
    } catch (error) {
        throw new Error('Failed to fetch chat messages: ' + error.message);
    } 
}
export default {
    createChat,
    getUserChats,
    sendMessage,
    getChatMessages,
    getFriendsList
}

