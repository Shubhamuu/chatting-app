export default function registerNotificationSocket(io, socket) {
  // join personal notification room
  socket.on("join_user", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined notification room`);
  });

  // send notification to specific user
  socket.on("send_notification", (data) => {
    // data: { userId, title, message }

    io.to(data.userId).emit("receive_notification", {
      title: data.title,
      message: data.message,
      time: new Date(),
    });
  });
}