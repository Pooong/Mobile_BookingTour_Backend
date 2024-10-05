const TourModel = require("../../Model/Tour/Tour.Model");
const BookingModel = require("../../Model/Booking/Booking.Model");
const TourService = require("../../Service/Tour/Tour.Service");
class BookingService {
  async bookTourNow(userID, payload) {
    try {
      const booking = new BookingModel({
        USER_ID: userID,
        LIST_TOURS: [
          {
            TOUR_ID: payload.tourID,
            START_DATE: payload.startDate,
            END_DATE: payload.endDate,
            START_TIME: payload.startTime,
            CALENDAR_TOUR_ID: payload.CALENDAR_TOUR_ID,
            SLOT: payload.numberOfPeople,
          },
        ],
        TOTAL_PRICE: payload.totalPrice,
        STATUS: "Pending",
        BOOKING_TYPE: "Online",
        CUSTOMER_PHONE: payload.CUSTOMER_PHONE,
        CUSTOMER_NAME: payload.CUSTOMER_NAME,
        CITIZEN_ID: payload.CITIZEN_ID,
      });
      await booking.save();
      return booking;
    } catch (error) {
      return {
        statusCode: 500,
        msg: "Có lỗi xảy ra khi đặt tour",
        error: error.message,
      };
    }
  }

  async updateBookingStatus({ bookingId, status, numberOfPeople }) {
    try {
      // Tìm booking bằng ID
      const booking = await BookingModel.findById(bookingId);
      if (!booking) throw new Error("Không tìm thấy đơn đặt tour");

      // Cập nhật trạng thái của đơn đặt phòng
      booking.STATUS = status;
      await booking.save();

      // Duyệt qua từng tour trong LIST_TOURS để cập nhật số lượng slot
      for (let tour of booking.LIST_TOURS) {
        // Cập nhật số slot trong CALENDAR_TOUR của tour bằng cách truyền TOUR_ID và CALENDAR_TOUR_ID
        await this.updateTourAvailability(
          tour.TOUR_ID,
          tour.CALENDAR_TOUR_ID,
          numberOfPeople
        );
      }

      return {
        statusCode: 200,
        msg: `Trạng thái booking đã được cập nhật thành ${status}`,
        data: booking,
      };
    } catch (error) {
      return {
        statusCode: 500,
        msg: "Có lỗi xảy ra khi cập nhật trạng thái booking",
        error: error.message,
      };
    }
  }

  async updateTourAvailability(tourID, calendarTourID, numberOfPeople) {
    try {
      // Tìm tour theo tourID
      const tour = await TourModel.findById(tourID);
      if (!tour) throw new Error("Không tìm thấy tour");

      // Tìm lịch tour (CalendarTour) trong mảng CALENDAR_TOUR dựa trên calendarTourID
      const calendarTour = tour.CALENDAR_TOUR.id(calendarTourID);
      if (!calendarTour) throw new Error("Không tìm thấy lịch tour");

      // Kiểm tra số lượng slot còn lại
      if (calendarTour.AVAILABLE_SLOTS < numberOfPeople) {
        throw new Error("Không đủ chỗ trống cho số lượng người yêu cầu");
      }

      // Giảm số slot còn lại dựa trên số người
      calendarTour.AVAILABLE_SLOTS -= numberOfPeople;

      // Nếu không còn chỗ trống, cập nhật trạng thái AVAILABLE
      if (calendarTour.AVAILABLE_SLOTS === 0) {
        calendarTour.AVAILABLE = false;
      }

      // Lưu thay đổi vào tour
      await tour.save();

      return {
        statusCode: 200,
        msg: "Số lượng chỗ trống của tour đã được cập nhật",
        data: calendarTour,
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch tour:", error.message);
      throw new Error("Lỗi khi cập nhật lịch tour");
    }
  }
}

module.exports = new BookingService();
