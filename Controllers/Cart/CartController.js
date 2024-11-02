const CartService = require("../../Service/Cart/CartService");
const CartValidator = require("../../Model/Cart/Validate/validateCart");
const Cart = require("../../Model/Cart/Cart.Model"); // Mô hình Cart từ MongoDB

class CartController {
  // Thêm tour vào giỏ hàng

  async addTourToCart(req, res) {
    const userId = req.user_id; // Lấy userId từ token hoặc session
    const payload = req.body; // Lấy thông tin tour từ body

    try {
      // Kiểm tra các trường bắt buộc
      if (
        !userId ||
        !payload.TOUR_ID ||
        !payload.START_DATE ||
        !payload.END_DATE
      ) {
        return res.status(400).json({
          success: false,
          message: "userId, TOUR_ID, startDate, endDate và price là bắt buộc.",
        });
      }

      // Gọi service để thêm tour vào giỏ hàng
      const result = await CartService.addTourToCart(payload, userId);

      // Kiểm tra nếu tour đã có trong giỏ hàng, trả về thông báo `success: false`
      if (result.success === false) {
        return res.status(200).json({
          success: false,
          message: result.message,
        });
      }

      // Trả về kết quả thành công
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.log(error);
      // Xử lý lỗi
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Xóa tour khỏi giỏ hàng
  async removeTourFromCart(req, res) {
    try {
      const userId = req.user_id; // Lấy userId từ token hoặc session
      const { TOUR_ID } = req.body; // Lấy TOUR_ID từ body

      // Kiểm tra TOUR_ID
      if (!TOUR_ID) {
        return res.status(400).json({ message: "TOUR_ID là bắt buộc." });
      }

      const result = await CartService.removeTourFromCart(userId, TOUR_ID);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Sửa tour trong giỏ hàng
  // Controller method to update a tour in the cart (using cartId and tourId from body)
  async updateTourInCart(req, res) {
    try {
      const {
        cartId,
        tourId,
        CALENDAR_TOUR_ID,
        START_DATE,
        END_DATE,
        START_TIME,
        NUMBER_OF_PEOPLE,
      } = req.body; // Lấy tất cả thông tin từ body

      if (!cartId || !tourId) {
        return res.status(400).json({
          message: "cartId và tourId là bắt buộc",
        });
      }

      // Gọi service để thực hiện cập nhật tour trong giỏ hàng
      const updatedCart = await CartService.updateTourInCart(cartId, tourId, {
        CALENDAR_TOUR_ID,
        START_DATE,
        END_DATE,
        START_TIME,
        NUMBER_OF_PEOPLE,
      });

      // Trả về phản hồi thành công với giỏ hàng đã được cập nhật
      res.status(200).json({
        message: "Cập nhật tour trong giỏ hàng thành công",
        cart: updatedCart,
      });
    } catch (error) {
      // Xử lý lỗi và trả về phản hồi lỗi
      res.status(500).json({
        message: "Có lỗi xảy ra khi cập nhật tour trong giỏ hàng",
        error: error.message,
      });
    }
  }

  // Lấy tất cả các tour trong giỏ hàng
  async getAllToursInCart(req, res) {
    try {
      console.log("OK");
      const { userId } = req.params;

      const result = await CartService.getAllToursInCart(userId);
      res.status(200).json(result);
    } catch (error) {
      console.log("@");
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
}
module.exports = new CartController();
