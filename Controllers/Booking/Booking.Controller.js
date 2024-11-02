const CartService = require("../../Service/Cart/CartService");
const BookingService = require("../../Service/Booking/Booking.Service");
const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
class Booking {
  async getTotalBooking(req, res) {
    try {
      const totalBooking = await BookingService.getTotalBooking();
      if (!totalBooking) {
        return res.status(404).json({
          success: false,
          message: "No bookings found.",
        });
      }
      return res.status(200).json({
        success: true,
        data: totalBooking,
      });
    } catch (error) {}
  }

  async getBookingByUserId(req, res) {
    const userId = req.user_id;
    // console.log(userId);
    try {
      const bookings = await BookingService.getBookingByUserId(userId);
      console.log("bookings", bookings);
      if (!bookings || bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No bookings found for this user.",
        });
      }

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async bookTourNow(req, res) {
    try {
      const userId = req.user_id;
      const payload = req.body;

      const booking = await BookingService.bookTourNow(userId, payload);

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error("Error booking tour:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error booking tour.",
        error: error.message,
      });
    }
  }
  async getAllBookings(req, res) {
    try {
      const bookings = await BookingService.getAllBookings();
      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  async bookTours(req, res) {
    try {
      // Lấy userId từ token hoặc từ request
      const userId = req.user_id;

      // Lấy danh sách thông tin các tour từ payload trong request body
      const toursDetails = req.body.toursDetails;

      const CUSTOMER_PHONE = req.body.CUSTOMER_PHONE;
      const CUSTOMER_NAME = req.body.CUSTOMER_NAME;
      const CITIZEN_ID = req.body.CITIZEN_ID;

      // Lấy loại booking nếu có, mặc định là "Online"
      const bookingType = req.body.bookingType || "Online";

      // Gọi service để thực hiện đặt nhiều tour
      const booking = await BookingService.bookTourNows(
        userId,
        toursDetails,
        CUSTOMER_PHONE,
        CUSTOMER_NAME,
        CITIZEN_ID,
        bookingType
      );

      // Trả về kết quả thành công
      return res.status(201).json({
        success: true,
        message: "Đặt tour thành công.",
        data: booking,
      });
    } catch (error) {
      console.error("Lỗi khi đặt tour:", error.message);

      // Trả về kết quả lỗi
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi đặt tour.",
        error: error.message,
      });
    }
  }
}

module.exports = new Booking();
