import { connectDB } from "../src/startup/db";
import { logger } from "../src/startup/logger";
import { prod } from "../src/startup/prod";
import { routes } from "../src/startup/routes";
import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
// import User from "./models/userModel";


const app = express();

logger;
routes(app);
connectDB();
prod(app);

app.get("/api/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://chat-forum.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers: { userId: string; socketId: string }[] = [];

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId) {
    if (!onlineUsers.some((user) => user.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    console.log("online users", onlineUsers);

    io.emit("getOnlineUsers", onlineUsers);

    // const user = await User.findById(userId).populate("courses");
    // if (user && user.courses) {
    //   const userCourses = user.courses;
    //   const userCourseIds = userCourses.map((course) => course._id.toString());
    //   userCourseIds.forEach((courseId) => {
    //     if (!socket.rooms.has(courseId)) {
    //       socket.join(courseId);
    //     }
    //   });
    // }

    socket.on("sendMessage", (message) => {
      const recipientSocket = onlineUsers.find(
        (user) => user.userId === message.recipientId
      );
      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit("getMessage", message);
      } else {
        console.warn("Recipient not found:", message.recipientId);
        // You can emit an error message to the sender here
      }
    });
  }

  socket.on("sendGroupMessage", (groupMessage) => {
    io.to(groupMessage.groupId).emit("getGroupMessage", groupMessage);
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

httpServer.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});

app.get("/", (req, res) => res.send("Express on Vercel"));

// app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;