export default function registerChatSocket(io, socket) {
  // join chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // send message
  socket.on("send_message", (data) => {
    // data: { roomId, content, sender }
    console.log(`Received message from ${data.sender.name} in room ${data.roomId}: ${data.content}`);
    io.to(data.roomId).emit("receive_message", {
      chatId: data.roomId,
      content: data.content,
      sender: data.sender, // Should be { _id, name }
      createdAt: new Date(),
    });
  });

  // typing event
  socket.on("typing_start", (data) => {
    socket.to(data.chatId).emit("typing_start", { chatId: data.chatId });
  });

  socket.on("typing_stop", (data) => {
    socket.to(data.chatId).emit("typing_stop", { chatId: data.chatId });
  });
}