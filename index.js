const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const port = 3000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dbConnect = require("./Config/dbconnect");
const route = require("./Router");
const mongoose = require("mongoose");
const Message = require("./Model/Message/MessageModel");
const User = require("./Model/User/User.Model");
dbConnect();

const server = http.createServer(app);
// Tích hợp Socket.io
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:8080"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
app.use(express.json());
app.use(cors());
// Sử dụng route từ router/index.js
route(app);

// Cấu hình body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Tăng giới hạn payload cho JSON và URL-encoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Xử lý kết nối Socket.IO
io.use((socket, next) => {
  console.log("Socket connected:", socket.id);
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication token is required."));
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.userId = decoded.userId; // Lưu userId vào socket
    console.log("User connected:", decoded.userId);
    next();
  } catch (err) {
    console.log("Error verifying token:", err);
    return next(new Error("Invalid token."));
  }
});
// Socket.IO logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("sendMessage", async (messageData) => {
    let { senderId, receiverId, content, senderName } = messageData;
    console.log("Message received:", messageData);
    try {
      // Nếu receiverId là "admin", chọn một admin ngẫu nhiên
      if (receiverId === "admin") {
        const admins = await User.find({ "ROLE.ADMIN": true }).select("_id");
        if (admins.length > 0) {
          const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
          receiverId = randomAdmin._id; // Chọn một admin ngẫu nhiên
        } else {
          console.error("No admins found.");
          return;
        }
      }
      // Tạo và lưu tin nhắn mới
      const message = new Message({
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(receiverId),
        content,
      });
      await message.save();
      // Gửi tin nhắn tới người nhận và người gửi
      io.to(receiverId.toString()).emit("receiveMessage", {
        senderId,
        receiverId,
        content,
        senderName,
        createdAt: message.createdAt,
      });
      io.to(senderId).emit("receiveMessage", {
        senderId,
        receiverId,
        content,
        senderName,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
