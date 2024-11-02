const Review = require("../../Model/Review/Review.Model");
const Booking = require("../../Model/Booking/Booking.Model");

class ReviewService {
  // Kiểm tra xem người dùng đã đặt tour hay chưa
  canUserReview = async (userId, tourId) => {
    const booking = await Booking.findOne({
      USER_ID: userId,
      LIST_TOURS: { $elemMatch: { TOUR_ID: tourId } },
      STATUS: "SUCCESS", // Giả định rằng STATUS 'SUCCESS' là đã đặt thành công
    });

    // Chỉ cho phép bình luận nếu booking tồn tại
    return !!booking;
  };

  // Thêm bình luận mới
  createReview = async ({ userId, tourId, rating, comment }) => {
    const newReview = new Review({
      USER_ID: userId,
      TOUR_ID: tourId,
      RATING: rating,
      COMMENT: comment,
      STATUS: true, // Set trạng thái bình luận là active (true)
    });

    await newReview.save();
    return newReview;
  };

  getReviewsByTourId = async (tourId) => {
    const reviews = await Review.find({ TOUR_ID: tourId })
      .populate("USER_ID", "FULLNAME EMAIL") // Lấy thêm thông tin người dùng nếu cần
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian mới nhất
    return reviews;
  };
}

module.exports = new ReviewService();
