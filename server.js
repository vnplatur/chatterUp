import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { chatModel, userConnect, userModel } from "./chatSchema.js";

import { connect } from "./config.js";
import { UserRoutes } from "./src/userRoutes.js";


const app = express();
app.use(cors());
app.use(express.json());

// 1. Creating server using http.
const server = http.createServer(app);

// 2. Create socket server.
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use("/api/users", UserRoutes);

// 3. Use socket events.

io.on("connect", async (socket) => {
  console.log("Connection is established");

  // Handle user joining a room
  socket.on("joinRoom", async ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined room ${room}`);

    // load the old messages
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    await chatModel
      .find({ timeStamp: { $gte: oneWeekAgo, $lte: new Date() } })
      .sort({ timeStamp: 1 })
      .limit(50) // finds data 1 week old
      .then((chats) => {
        chats.forEach(async (chat) => {
          const user = await userModel.findOne({ username: chat.username });
          const time = new Date(chat.timeStamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Set to true for 12-hour format (e.g., AM/PM)
          });
          const userData = {
            name: chat.username,
            message: chat.message,
            time,
            imageUrl: user.imageUrl,
          };

          socket.emit("load_messages", userData);
        });
      })
      .catch((err) => {
        console.log(err);
      });

      const newuser = new userConnect({username,socketId: socket.id,roomNo:room})
      await newuser.save();

      const users = await userConnect.find({roomNo:room}).select("username -_id");
      
      // Notify others in the room
      io.to(room).emit("userUpdate",{
        users:users, 
        count:users.length
      })

    
  });

  socket.on("typing", ({ username, room }) => {
    socket.broadcast.to(room).emit("userTyping", { username });
  });

  socket.on("stopTyping", ({ username, room }) => {
    socket.broadcast.to(room).emit("userStoppedTyping", { username });
  });

  // Handle chat messages
  socket.on("chatMessage", async ({ username, room, message }) => {
    // store to Database
    console.log(username, room, message);
    const user = await userModel.findOne({ username });
    const newChat = new chatModel({
      username,
      message,
      roomNo: room,
      timeStamp: new Date(),
    });
    await newChat.save();
    console.log(user);
    const time = new Date(newChat.timeStamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Set to true for 12-hour format (e.g., AM/PM)
    });

    socket.broadcast.to(room).emit("message", {
      name: username,
      message,
      time,
      imageUrl: user.imageUrl,
    }); // broadcast will send to other then user
  });

  socket.on("disconnect", async () => {
    const removed = await userConnect.findOneAndDelete({ socketId: socket.id });
    if(removed){
      const roomNo = removed.roomNo;
      console.log(roomNo);
      const users = await userConnect.find({roomNo:roomNo}).select("username -_id");

      // Notify others in the room
      socket.broadcast.to(roomNo).emit("userUpdate",{
        users:users, 
        count:users.length
      })
    }
    console.log("Connection is disconnected");
  });
});

server.listen(3000, () => {
  console.log("App is listening on 3000");
  connect();
});
