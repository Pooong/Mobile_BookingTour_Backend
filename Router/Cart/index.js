const express = require("express");
const router = express.Router();

const CartController = require("../../Controllers/Cart/CartController.js");
const { verifyToken } = require("../../Middleware/verifyToken.js");
const authorRole = require("../../Middleware/author.js");

router.post("/addTourToCart", verifyToken, CartController.addTourToCart);
// Thêm tour vào giỏ hàng
router.post(
  "/removeTourFromCart",
  verifyToken,
  CartController.removeTourFromCart
); // Xóa tour khỏi giỏ hàng
router.post(
  "/updateTourInCart/:cartId",
  verifyToken,
  CartController.updateTourInCart
); // Sửa tour trong giỏ hàng
router.get(
  "/allTourCart/:userId",
  verifyToken,
  CartController.getAllToursInCart
); // Lấy tất cả tour trong giỏ hàng

module.exports = router;
