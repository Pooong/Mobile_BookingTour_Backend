const CartService = require("../../Service/Cart/CartService");
const BookingService = require("../../Service/Booking/Booking.Service");

class Booking {
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
}

module.exports = new Booking();
