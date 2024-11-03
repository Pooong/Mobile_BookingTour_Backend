const TourService = require("../../Service/Tour/Tour.Service");
const ValidateTour = require("../../Model/Tour/validate/validateTour");
const CLOUDINARY = require("../../Config/cloudinaryConfig");
const Booking = require("../../Model/Booking/Booking.Model");
class TourController {
  getAllTours = async (req, res) => {
    try {
      const tours = await TourService.getAllTours(); // Gọi hàm từ service
      res.status(200).json(tours); // Trả về danh sách tour
    } catch (error) {
      console.error("Error fetching tours:", error); // In lỗi ra console
      res.status(500).json({ message: "Error retrieving tours" }); // Thông báo lỗi
    }
  };

  // Tạo tour mới
  createTour = async (req, res) => {
    const payload = req.body;
    console.log(payload);
    try {
      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        uploadedImages = await Promise.all(
          req.files.map(async (file) => {
            const uploadResult = await CLOUDINARY.uploader.upload(file.path); // Upload lên Cloudinary
            return uploadResult.secure_url; // Trả về URL ảnh đã upload
          })
        );
      }

      // **Upload ảnh từ URL (nếu có)**
      if (payload.IMAGES && payload.IMAGES.length > 0) {
        const urlUploads = await Promise.all(
          payload.IMAGES.map(async (imageUrl) => {
            if (imageUrl.startsWith("http")) {
              const uploadResult = await CLOUDINARY.uploader.upload(imageUrl); // Upload từ URL
              return uploadResult.secure_url;
            }
          })
        );
        uploadedImages = uploadedImages.concat(urlUploads); // Kết hợp cả ảnh từ file và URL
      }

      // Gán ảnh đã upload vào payload
      payload.IMAGES = uploadedImages;

      await TourService.createTour(payload);
      return res.status(200).json({
        success: true,
        message: "Tạo TOUR thành công!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        errors: err,
      });
    }
  };

  createCalendarTour = async (req, res) => {
    const payload = req.body;
    try {
      const createdCalendarTour = await TourService.createCalendarTour(payload);
      return res.status(200).json({
        success: true,
        message: "Tạo lịch TOUR thành công!",
        tour: createdCalendarTour,
      });
    } catch (err) {
      return res.status(500).json({ errors: "Tạo lịch TOUR thất bại!" });
    }
  };

  // Cập nhật tour theo ID
  updateTour = async (req, res) => {
    console.log("updateTour");
    const id = req.params.id;
    const payload = req.body;
    let uploadedImages = [];

    try {
      // Xử lý tải lên tệp ảnh
      if (req.files && req.files.length > 0) {
        uploadedImages = await Promise.all(
          req.files.map(async (file) => {
            const uploadResult = await CLOUDINARY.uploader.upload(file.path);
            return uploadResult.secure_url;
          })
        );
      }

      // Xử lý URL hình ảnh
      if (payload.IMAGES && payload.IMAGES.length > 0) {
        const urlUploads = await Promise.all(
          payload.IMAGES.map(async (imageUrl) => {
            if (imageUrl.startsWith("http")) {
              return imageUrl;
            } else {
              const uploadResult = await CLOUDINARY.uploader.upload(imageUrl);
              return uploadResult.secure_url;
            }
          })
        );
        uploadedImages = uploadedImages.concat(urlUploads);
      }

      // Gộp hình ảnh đã upload với hình ảnh hiện có
      payload.IMAGES = uploadedImages;

      const updatedTour = await TourService.updateTourById(id, payload);
      console.log(updatedTour);
      if (!updatedTour) {
        return res.status(404).json({ errors: "Tour không tồn tại!" });
      }
      return res.status(200).json({
        success: true,
        message: "Cập nhật tour thành công!",
        tour: updatedTour,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errors: "Cập nhật tour thất bại!" });
    }
  };

  // Xóa tour theo ID
  deleteTour = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedTour = await TourService.deleteTourById(id);
      if (!deletedTour) {
        return res.status(404).json({ errors: "Tour không tồn tại!" });
      }
      return res.status(200).json({
        success: true,
        message: "Xóa TOUR thành công!",
      });
    } catch (err) {
      return res.status(500).json({ errors: "Xóa TOUR thất bại!" });
    }
  };

  // Lấy danh sách các tour và tìm kiếm
  getTours = async (req, res) => {
    const { tabStatus, page, limit, search } = req.query;

    try {
      const result = await TourService.getToursAndSearch(
        tabStatus,
        parseInt(page),
        parseInt(limit),
        search
      );
      return res.status(200).json({
        success: true,
        tours: result.tours,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      });
    } catch (err) {
      return res.status(500).json({ errors: "Lấy danh sách TOUR thất bại!" });
    }
  };

  // Lấy thông tin một tour theo ID
  getTourById = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      const tour = await TourService.getTourById(id);
      if (!tour) {
        return res.status(404).json({ errors: "Tour không tồn tại!" });
      }
      return res.status(200).json({
        success: true,
        tour,
      });
    } catch (err) {
      return res.status(500).json({ errors: "Lấy thông tin TOUR thất bại!" });
    }
  };

  // Tìm kiếm tour
  async searchTour(req, res) {
    const searchQuery = req.query; // Nhận tham số từ query
    console.log("searchQuery", searchQuery);

    try {
      const tours = await TourService.searchTour(searchQuery);

      if (!tours.success) {
        return res.status(400).json({
          success: false,
          message: tours.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: tours.data, // Trả về kết quả tìm kiếm
      });
    } catch (error) {
      console.error("Error searching tours:", error); // Ghi log lỗi
      return res.status(500).json({
        success: false,
        message: "Error searching tours",
        error: error.message,
      });
    }
  }
  async getDailyRevenue(req, res) {
    try {
      const { day, month, year } = req.params;
      const dailyRevenue = await TourService.calculateDailyRevenue(
        day,
        month,
        year
      );

      res.status(200).json({
        success: true,
        data: dailyRevenue,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error calculating daily revenue",
        error: error.message,
      });
    }
  }

  // Lấy tổng doanh thu từ tất cả các tour
  async getTotalRevenue(req, res) {
    try {
      const { year } = req.query; // Get year from query parameters if provided
      const totalRevenue = await TourService.calculateTotalRevenue(year);

      res.status(200).json({
        success: true,
        totalRevenue,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error calculating total revenue",
        error: error.message,
      });
    }
  }
  // Lấy doanh thu theo từng tour
  getRevenuePerTour = async (req, res) => {
    try {
      const revenuePerTour = await TourService.calculateRevenuePerTour();
      res.status(200).json({
        success: true,
        data: revenuePerTour,
      });
    } catch (error) {
      console.error("Error calculating revenue per tour:", error);
      res.status(500).json({
        success: false,
        message: "Error calculating revenue per tour",
      });
    }
  };

  // Lấy doanh thu theo loại tour
  getRevenueByTourType = async (req, res) => {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Tour type is required." });
    }

    try {
      const revenue = await TourService.calculateRevenueByTourType(type);
      return res.status(200).json({
        success: true,
        type,
        revenue,
      });
    } catch (error) {
      console.error("Error in getRevenueByTourType controller:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

  getMonthlyRevenue = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }

    try {
      const revenue = await TourService.calculateMonthlyRevenue(
        parseInt(month),
        parseInt(year)
      );

      return res.status(200).json({
        success: true,
        month,
        year,
        revenue,
      });
    } catch (error) {
      console.error("Error in getMonthlyRevenue controller:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
  async getTopRevenueTours(req, res) {
    try {
      const topTours = await TourService.getTopRevenueTours();
      res.status(200).json({
        success: true,
        data: topTours,
      });
    } catch (error) {
      console.error("Error fetching top revenue tours:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy 3 tour có doanh thu cao nhất",
      });
    }
  }

  getLatestTours = async (req, res) => {
    try {
      const latestTours = await TourService.getLatestTours();
      res.status(200).json({
        success: true,
        message: "Lấy 3 tour mới nhất thành công!",
        data: latestTours,
      });
    } catch (error) {
      console.error("Lỗi khi lấy 3 tour mới nhất:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy 3 tour mới nhất",
      });
    }
  };
}

module.exports = new TourController();
