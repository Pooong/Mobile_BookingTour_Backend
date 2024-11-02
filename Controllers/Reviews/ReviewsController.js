const ReviewService = require("../../Service/Reviews/ReviewsService");

class ReviewController {
  getReviewsByTourId = async (req, res) => {
    const { tourId } = req.params;
    try {
      const reviews = await ReviewService.getReviewsByTourId(tourId);
      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy đánh giá",
      });
    }
  };
  // Thêm bình luận cho tour
  addReview = async (req, res) => {
    const userId = req.user_id;
    console.log("userId", userId);
    const { tourId, rating, comment } = req.body;

    try {
      // Kiểm tra xem người dùng đã đặt tour này chưa
      const canReview = await ReviewService.canUserReview(userId, tourId);
      if (!canReview) {
        return res.status(400).json({
          success: false,
          message: "Bạn chỉ có thể bình luận sau khi đã đặt tour này.",
        });
      }

      // Thêm bình luận mới
      const newReview = await ReviewService.createReview({
        userId,
        tourId,
        rating,
        comment,
      });

      return res.status(201).json({
        success: true,
        message: "Thêm bình luận thành công!",
        data: newReview,
      });
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi thêm bình luận",
      });
    }
  };
}

module.exports = new ReviewController();
