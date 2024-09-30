const Cart = require("../../Model/Cart/Cart.Model"); // Mô hình Cart từ MongoDB
const Tour = require("../../Model/Tour/Tour.Model"); // Mô hình Tour từ MongoDB

class CartService {
  async createCart(userId) {
    const newCart = new Cart({
      USER_ID: userId,
      LIST_TOUR_REF: [],
      TOTAL_PRICE: 0,
    });

    await newCart.save();
    return newCart;
  }

  async addTourToCart(payload, userID) {
    console.log(payload);
    // Tìm kiếm giỏ hàng của người dùng dựa trên userId
    let cart = await Cart.findOne({ USER_ID: userID });
    // Nếu không có giỏ hàng, tạo mới giỏ hàng cho người dùng

    if (!cart) {
      cart = await this.createCart(userID);
    }

    if (!payload.TOUR_ID || !payload.START_DATE || !payload.END_DATE) {
      throw new Error("TOUR_ID không hợp lệ");
    }

    // Nếu đã có giỏ hàng, kiểm tra tour có trong giỏ chưa
    const tourExists = cart.LIST_TOUR_REF.some(
      (tour) => tour.TOUR_ID.toString() === payload.TOUR_ID.toString()
    );

    if (!tourExists) {
      // Nếu chưa có tour trong giỏ, thêm tour vào giỏ hàng
      cart.LIST_TOUR_REF.push(payload);
      let TOUR = await Tour.findById(payload.TOUR_ID);
      // console.log(TOUR);
      let PriceTour = TOUR.PRICE_PER_PERSON; // Lấy giá tour

      cart.TOTAL_PRICE = cart.TOTAL_PRICE + PriceTour; // Cộng thêm giá vào tổng
    } else {
      return { message: "Tour đã có trong giỏ hàng" };
    }
    // Lưu giỏ hàng vào cơ sở dữ liệu
    await cart.save();

    return { message: "Đã thêm tour vào giỏ hàng thành công", cart };
  }

  // Xóa tour khỏi giỏ hàng
  async removeTourFromCart(userId, TOUR_ID) {
    try {
      // Tìm kiếm giỏ hàng của người dùng dựa trên userId
      const cart = await Cart.findOne({ USER_ID: userId });

      if (!cart) {
        throw new Error("Giỏ hàng không tồn tại");
      }

      // Tìm tour cần xóa
      const tourIndex = cart.LIST_TOUR_REF.findIndex(
        (tour) => tour.TOUR_ID.toString() === TOUR_ID.toString() // So sánh đúng kiểu dữ liệu
      );

      if (tourIndex === -1) {
        throw new Error("Tour không tồn tại trong giỏ hàng");
      }

      // Lấy tour cần xóa
      const tourToRemove = cart[tourIndex];

      // Xóa tour khỏi giỏ hàng
      cart.LIST_TOUR_REF.splice(tourIndex, 1);

      // Cập nhật tổng giá
      cart.TOTAL_PRICE -= tourToRemove.price; // Đảm bảo giá tour được lưu trong tourToRemove

      // Lưu giỏ hàng vào cơ sở dữ liệu
      await cart.save();

      return { message: "Đã xóa tour khỏi giỏ hàng thành công", cart };
    } catch (error) {
      console.error("Lỗi khi xóa tour khỏi giỏ hàng:", error);
      throw new Error("Không thể xóa tour khỏi giỏ hàng");
    }
  }

  // Sửa thông tin tour trong giỏ hàng
  async updateTourInCart(cartId, tourId, tourData) {
    const { START_DATE, END_DATE } = tourData;
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Giỏ hàng không tồn tại");

    // Tìm tour cần sửa
    const tour = cart.LIST_TOUR_REF.find(
      (tour) => tour.TOUR_ID.toString() === tourId
    );

    if (!tour) throw new Error("Tour không tồn tại trong giỏ hàng");

    // Cập nhật thông tin tour
    tour.START_DATE = START_DATE || tour.START_DATE;
    tour.END_DATE = END_DATE || tour.END_DATE;

    await cart.save();
    return cart;
  }

  // Lấy tất cả các tour trong giỏ hàng
  async getAllToursInCart(userId) {
    const cart = await Cart.findOne({ USER_ID: userId }).populate(
      "LIST_TOUR_REF.TOUR_ID"
    );
    if (!cart) throw new Error("Giỏ hàng không tồn tại");
    return cart;
  }
}

module.exports = new CartService();
