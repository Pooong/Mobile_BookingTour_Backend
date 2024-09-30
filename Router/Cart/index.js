const express = require("express");
const CartController = require("../../Controllers/Cart/CartController.js");
const router = express.Router();
const { verifyToken } = require("../../Middleware/verifyToken.js");
const authorRole = require("../../Middleware/author.js");

router.post("/addTourToCart", verifyToken, CartController.addTourToCart);
// Thêm tour vào giỏ hàng
router.delete(
  "/removeTourFromCart",
  verifyToken,
  CartController.removeTourFromCart
); // Xóa tour khỏi giỏ hàng
router.put(
  "/updateTourInCart/:cartId/:tourId",
  verifyToken,
  CartController.updateTourInCart
); // Sửa tour trong giỏ hàng
router.get(
  "/allTourCart/:userId",
  verifyToken,
  CartController.getAllToursInCart
); // Lấy tất cả tour trong giỏ hàng

module.exports = router;
