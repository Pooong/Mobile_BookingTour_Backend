const TourService = require("../../Service/Tour/Tour.Service");
const ValidateTour = require("../../Model/Tour/validate/validateTour");

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
    // const { error, value } = ValidateTour.validate(payload);
    // if (error) {
    //   const errors = error.details.reduce((acc, current) => {
    //     acc[current.context.key] = current.message;
    //     return acc;
    //   }, {});
    //   return res.status(400).json({ errors });
    // }
    try {
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => ({ path: file.path })); // Lấy đường dẫn tạm thời từ Multer
        payload.IMAGES = images;
      }
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
    const { id } = req.params;
    const payload = req.body;
    const { error, value } = ValidateTour.validateTour(payload);

    if (error) {
      const errors = error.details.reduce((acc, current) => {
        acc[current.context.key] = current.message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }

    try {
      const updatedTour = await TourService.updateTourById(id, payload);
      if (!updatedTour) {
        return res.status(404).json({ errors: "Tour không tồn tại!" });
      }
      return res.status(200).json({
        success: true,
        message: "Cập nhật TOUR thành công!",
        tour: updatedTour,
      });
    } catch (err) {
      return res.status(500).json({ errors: "Cập nhật TOUR thất bại!" });
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
    const { id } = req.params;
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
  searchTours = async (req, res) => {
    try {
      const { tabStatus, page = 1, limit = 10, search = "" } = req.query;

      const result = await TourService.getToursAndSearch(
        tabStatus,
        parseInt(page),
        parseInt(limit),
        search
      );

      res.status(200).json({
        success: true,
        data: result.tours,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi truy vấn người dùng.",
        error: err.message,
      });
    }
  };
}

module.exports = new TourController();
