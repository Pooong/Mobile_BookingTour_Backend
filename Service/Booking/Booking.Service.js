const TourModel = require("../../Model/Tour/Tour.Model");
const BookingModel = require("../../Model/Booking/Booking.Model");
const TourService = require("../../Service/Tour/Tour.Service");
const USER_MODEL = require("../../Model/User/User.Model");
const MAIL_QUEUE = require("../../Utils/sendMail");
class BookingService {
  async getTotalBooking() {
    try {
      const totalBooking = await BookingModel.countDocuments();
      return totalBooking;
    } catch (error) {
      throw new Error("Error fetching total bookings: " + error.message);
    }
  }
  async getBookingByUserId(userId) {
    try {
      const bookings = await BookingModel.find({ USER_ID: userId }).populate({
        path: "LIST_TOURS.TOUR_ID",
        select: "TOUR_NAME IMAGES LOCATION",
      });
      // console.log("bookings", bookings);
      return bookings;
    } catch (error) {
      throw new Error(
        `Error retrieving bookings for user ${userId}: ${error.message}`
      );
    }
  }
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
  async getAllBookings() {
    try {
      // Lấy bookings và populate thông tin user và tour
      let bookings = await BookingModel.find()
        .populate("USER_ID", "FULLNAME EMAIL")
        .populate({
          path: "LIST_TOURS.TOUR_ID",
          select: "TOUR_NAME IMAGES  PRICE_PER_PERSON",
        });

      // Lấy hình ảnh đầu tiên trong IMAGES và gán lại vào danh sách tour
      bookings = bookings.map((booking) => {
        booking.LIST_TOURS = booking.LIST_TOURS.map((tour) => {
          if (tour.TOUR_ID && tour.TOUR_ID.IMAGES.length > 0) {
            tour.TOUR_ID.IMAGES = [tour.TOUR_ID.IMAGES[0]];
          }
          return tour;
        });
        return booking;
      });

      return bookings;
    } catch (error) {
      throw new Error("Error fetching bookings: " + error.message);
    }
  }

  //UPDATE BOOKING STATUS
  async updateBookingStatus({ bookingId, status }) {
    try {
      // Tìm booking bằng ID
      const booking = await BookingModel.findById(bookingId);
      if (!booking) throw new Error("Không tìm thấy đơn đặt tour");

      const user = await USER_MODEL.findById(booking.USER_ID);
      if (!user || !user.EMAIL)
        throw new Error("Không tìm thấy người dùng hoặc email không tồn tại");
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
      if (status === "SUCCESS") {
        const emailContent = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #4CAF50;">Xin chào ${user.FULLNAME},</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Chúc mừng bạn đã đặt tour thành công với mã đơn  
            <strong style="color: #FF5722;">${bookingId}</strong>. Chi tiết đơn  như sau:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Tên khách hàng:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${booking.CUSTOMER_NAME}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Thời gian đặt tour:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                ${booking.LIST_TOURS[0].START_DATE} - ${booking.LIST_TOURS[0].END_DATE}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Tổng tiền:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong style="color: #FF5722;">${booking.TOTAL_PRICE} VND</strong>
              </td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 16px; line-height: 1.5;">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! Chúc bạn có một kỳ nghỉ vui vẻ.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://example.com" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Xem chi tiết đơn </a>
          </div>
        </div>
      `;

        // Đưa email vào hàng đợi
        await MAIL_QUEUE.enqueue({
          email: user.EMAIL,
          otp: "", // Không cần OTP cho xác nhận booking
          otpType: "BookingConfirmation",
          content: emailContent,
        });
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
