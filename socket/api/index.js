import { Server } from "socket.io";
import User from "../../server/src/models/userModel.ts"
import express from "express";

const app = express()

const io = new Server({
    cors: {
      origin:  process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  
  let onlineUsers = [];
  
  io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);
  
    const {userId} = socket.handshake.query
  
    if (userId) {
      if (!onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({ userId, socketId: socket.id });
      }
      console.log("online users", onlineUsers);
  
      io.emit("getOnlineUsers", onlineUsers);
  
      const user = await User.findById(userId).populate("courses");
         if (user && user.courses) {
        const userCourses = user.courses;
        const userCourseIds = userCourses.map((course) => course._id.toString());
        userCourseIds.forEach((courseId) => {
          if (!socket.rooms.has(courseId)) {
            socket.join(courseId);
            console.log(`User ${userId} joined room ${courseId}`);
          }
        });
      }
  
      socket.on("sendMessage", (message) => {
        const recipientSocket = onlineUsers.find(
          (user) => user.userId === message.recipientId
        );
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit("getMessage", message);
          io.to(recipientSocket.socketId).emit("getNotifications", {
            sender: message.sender,
            isRead: false,
            date: new Date(),
            chatId: message.chatId
          })
        } else {
          console.warn("Recipient not found:", message.recipientId);
          // You can emit an error message to the sender here
        }
      });
    }
  
    socket.on("sendGroupMessage", (groupMessage) => {
      io.to(groupMessage.courseId).emit("getGroupMessage", groupMessage);
      io.to(groupMessage.courseId).emit("getGroupNotifications", {
        sender: groupMessage.sender,
        isRead: false,
        date: new Date(),
        courseId: groupMessage.courseId,
        chatId: groupMessage.chatId
      })
    });
  
    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", reason, socket.id);
      if (userId) {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        console.log("User disconnected", socket.id);
      }
    });
  
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  io.listen(3000)

  app.get("/", (req, res) => res.send("Express on Vercel"));

// app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;