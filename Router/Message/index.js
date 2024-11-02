const express = require("express");
const router = express.Router();
const { getMessages } = require("../../Controllers/Message/Message.Controller");
const Message = require("../../Model/Message/MessageModel");
// Định tuyến để lấy tin nhắn giữa hai người dùng
router.get("/:userId/:receiverId", getMessages);
router.post("/sendMessage", async (req, res) => {
  console.log("11111111111");
  const { senderId, receiverId, content } = req.body;
  console.log("123" + senderId + receiverId + content);
  try {
    const newMessage = new Message({ senderId, receiverId, content });
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error saving message." });
  }
});
module.exports = router;
