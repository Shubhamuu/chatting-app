import chatController from '../controllers/chat.controller.js';


export default function registerChatSocket(io, socket) {
  // join chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // send message

socket.on("send_message", async (data) => {
  const { chatId, content, sender, tempId } = data;

  let savedMessage = null;

  await chatController.sendMessage(
    { body: { chatId, content }, user: sender },
    {
      status: (code) => ({
        json: (response) => {
          if (code === 201) {
            savedMessage = response.message ?? response.data ?? response;
            console.log(`Message sent successfully in chat ${chatId}`);
          } else {
            console.error(`Failed to send message in chat ${chatId}:`, response.message);
          }
        },
      }),
    }
  );

  if (!savedMessage) return; // don't broadcast if save failed

  io.to(chatId).emit("receive_message", {
    _id: savedMessage._id,
    chatId,
    content: savedMessage.content ?? content,
    sender: { _id: sender._id, name: sender.name },
    createdAt: savedMessage.createdAt ?? new Date().toISOString(),
    tempId, // pass through so client can reconcile if needed later
  });
});

  // typing event
  socket.on("typing_start", (data) => {
   
    socket.to(data.chatId).emit("typing_start", { chatId: data.chatId, userId: data.userId });
  });

  socket.on("typing_stop", (data) => {
   
    socket.to(data.chatId).emit("typing_stop", { chatId: data.chatId, userId: data.userId });
  });
}