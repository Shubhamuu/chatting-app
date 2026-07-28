import mongoose from "mongoose";
import User from "../src/models/user.js";
import Conversation from "../src/models/conversation.model.js";
import Message from "../src/models/message.model.js";
import bcrypt from "bcryptjs";
import { MONGO_URI,DB_NAME } from "../src/constants/getenv.js";


await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
    });

console.log("MongoDB connected");

/* -------------------- CREATE 20 USERS -------------------- */

const users = [];

for (let i = 1; i <= 20; i++) {
  users.push({
    name: `User ${i}`,
    email: `user${i}@egmail.com`,
    password: await bcrypt.hash("password", 10),
  });
}

const createdUsers = await User.insertMany(users);

console.log("20 users created");

/* -------------------- CREATE CONVERSATIONS + MESSAGES -------------------- */

const sampleMessages = [
  "Hey bro",
  "How are you?",
  "Let's meet tomorrow",
  "Did you finish the project?",
  "Call me when free",
  "Where are you?",
  "Check the files",
  "Nice work 🔥",
  "Good morning",
  "See you soon",
  "Let's deploy tonight",
  "Can you review this?",
  "I sent the document",
  "Working on backend",
  "Frontend completed",
  "API fixed",
  "Database updated",
  "Let's test it",
  "Meeting at 5 PM",
  "Done 👍",
];

for (let i = 0; i < createdUsers.length; i++) {
  for (let j = i + 1; j < createdUsers.length; j++) {

    const user1 = createdUsers[i];
    const user2 = createdUsers[j];

    /* Create Conversation */

    const conversation = await Conversation.create({
      participants: [user1._id, user2._id],
      isGroup: false,
      lastActivity: new Date(),
    });

    const messages = [];

    /* Create 20 Messages */

    for (let k = 0; k < 20; k++) {

      const sender =
        k % 2 === 0 ? user1._id : user2._id;

      messages.push({
        conversationId: conversation._id,
        sender,
        content:
          sampleMessages[
            Math.floor(Math.random() * sampleMessages.length)
          ],
        messageType: "text",
        status: "seen",
        readBy: [user1._id, user2._id],
        createdAt: new Date(
          Date.now() - (20 - k) * 60000
        ),
        updatedAt: new Date(
          Date.now() - (20 - k) * 60000
        ),
      });
    }

    const createdMessages = await Message.insertMany(messages);

    /* Update Conversation */

    const lastMessage =
      createdMessages[createdMessages.length - 1];

    conversation.lastMessage = lastMessage._id;
    conversation.lastActivity = lastMessage.createdAt;

    await conversation.save();

    console.log(
      `Conversation created between ${user1.name} and ${user2.name}`
    );
  }
}

console.log("Seeding completed");

await mongoose.disconnect();