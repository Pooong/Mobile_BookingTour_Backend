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

  //BOOK TOURS FROM CART
  async bookTourNows(
    userId,
    toursDetails,
    CUSTOMER_PHONE,
    CUSTOMER_NAME,
    CITIZEN_ID,
    bookingType = "Online"
  ) {
    try {
      let listTours = [];
      let totalPrice = 0;

      // Kiểm tra nếu toursDetails không hợp lệ hoặc không chứa thông tin cần thiết
      if (
        !toursDetails ||
        (Array.isArray(toursDetails) && toursDetails.length === 0)
      ) {
        throw new Error("Thông tin tour không hợp lệ hoặc bị thiếu.");
      }

      // Kiểm tra nếu chỉ có một tour (object) hoặc nhiều tour (array)
      const isSingleTour = !Array.isArray(toursDetails);
      if (isSingleTour) {
        toursDetails = [toursDetails];
      }

      for (const tourDetails of toursDetails) {
        const tourId = tourDetails.TOUR_ID || tourDetails.tourId;
        if (!tourId) {
          throw new Error("Thiếu TOUR_ID trong thông tin tour.");
        }

        const tour = await TourService.getTourById(tourId);
        if (!tour) {
          throw new Error("Tour không tồn tại.");
        }

        // Thêm tour vào danh sách booking mà không cần tính toán giá
        listTours.push({
          TOUR_ID: tourId,
          CALENDAR_TOUR_ID: tourDetails.CALENDAR_TOUR_ID,
          START_DATE: new Date(tourDetails.START_DATE),
          END_DATE: new Date(tourDetails.END_DATE),
          START_TIME: tourDetails.START_TIME,
          SLOT: tourDetails.SLOT,
          TOTAL_PRICE_TOUR: tourDetails.TOTAL_PRICE_TOUR, // Sử dụng giá từ request body
        });

        // Cộng tổng giá từ tham số truyền vào
        totalPrice += tourDetails.TOTAL_PRICE_TOUR;
      }

      const booking = new BookingModel({
        USER_ID: userId,
        LIST_TOURS: listTours,
        TOTAL_PRICE: totalPrice, // Sử dụng tổng giá từ tham số đã truyền vào
        STATUS: "Pending",
        BOOKING_TYPE: bookingType,
        CUSTOMER_PHONE: CUSTOMER_PHONE,
        CUSTOMER_NAME: CUSTOMER_NAME,
        CITIZEN_ID: CITIZEN_ID,
      });

      await booking.save();
      return booking;
    } catch (error) {
      throw new Error(`Lỗi khi đặt tour: ${error.message}`);
    }
  }

  //UPDATE BOOKING STATUS
  async updateBookingStatus({ bookingId, status }) {
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
          tour.SLOT
        );
      }

      return {
        statusCode: 200,
        msg: `Đặt Tour Thành Công !!!`,
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

      console.log("tour", tour);
      // Tìm lịch tour (TOUR_CALENDAR) dựa trên calendarTourID trong mảng CALENDAR_TOUR
      const calendarTour = tour.CALENDAR_TOUR.find(
        (tourItem) => tourItem._id.toString() === calendarTourID.toString()
      );
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
