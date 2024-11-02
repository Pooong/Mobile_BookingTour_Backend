const TourModel = require("../../Model/Tour/Tour.Model");
const CLOUDINARY = require("../../Config/cloudinaryConfig");
const BookingModel = require("../../Model/Booking/Booking.Model");
class TourService {
  getAllTours = async () => {
    try {
      console.log("OKE ALL TOURS");
      const tours = await TourModel.find().populate({
        path: "ID_TOUR_GUIDE_SUPERVISOR", // Trường cần populate trong TourModel
        select: "FULLNAME PHONE_NUMBER", // Các thuộc tính muốn lấy từ bảng users
      });
      return tours; // Trả về danh sách tour đã được populate thông tin user
    } catch (error) {
      console.error("Error retrieving tours:", error); // In lỗi ra console
      throw new Error("Error retrieving tours"); // Ném lỗi với thông điệp rõ ràng
    }
  };

  async getTourById(id) {
    try {
      const tour = await TourModel.findById(id).lean().populate({
        path: "ID_TOUR_GUIDE_SUPERVISOR",
        select: "FULLNAME PHONE_NUMBER",
      });
      // console.log(tour); // Sử dụng lean() để trả về plain object
      if (!tour) {
        throw new Error("Tour không tồn tại");
      }
      return tour;
    } catch (error) {
      console.error("Lỗi khi lấy tour theo ID:", error);
      throw new Error("Lỗi khi lấy tour theo ID");
    }
  }
  // Tạo tour mới
  async createTour(data) {
    const newTour = new TourModel(data);
    let uploadedImages = []; // Đảm bảo biến được định nghĩa trước
    if (data.IMAGES && data.IMAGES.length > 0) {
      uploadedImages = await Promise.all(
        data.IMAGES.map(async (image) => {
          if (typeof image === "string" && image.startsWith("http")) {
            // Upload từ URL
            const uploadResult = await CLOUDINARY.uploader.upload(image);
            return uploadResult.secure_url;
          } else if (image.path) {
            // Upload từ file cục bộ
            const uploadResult = await CLOUDINARY.uploader.upload(image.path);
            return uploadResult.secure_url;
          }
        })
      );
    }
    newTour.IMAGES = uploadedImages;
    const result = await newTour.save();
    return result.toObject();
  }

  createCalendarTour = async (data) => {};

  // Cập nhật tour theo ID
  // async updateTourById(id, tourData) {
  //   try {
  //     const currentTour = await TourModel.findById(id);
  //     if (!currentTour) throw new Error("Tour không tồn tại!");

  //     // Chỉ cập nhật các trường đã thay đổi
  //     if (tourData.IMAGES && tourData.IMAGES.length > 0) {
  //       tourData.IMAGES = [...currentTour.IMAGES, ...tourData.IMAGES];
  //     }

  //     const updatedTour = await TourModel.findByIdAndUpdate(
  //       id,
  //       { ...tourData },
  //       { new: true }
  //     );
  //     return updatedTour;
  //   } catch (err) {
  //     console.error("Lỗi khi cập nhật tour:", err);
  //     throw new Error("Cập nhật tour thất bại");
  //   }
  // }
  async updateTourById(id, tourData) {
    try {
      const currentTour = await TourModel.findById(id);
      if (!currentTour) throw new Error("Tour không tồn tại!");

      // Thay thế hoàn toàn dữ liệu ảnh nếu có ảnh mới
      if (tourData.IMAGES && tourData.IMAGES.length > 0) {
        currentTour.IMAGES = tourData.IMAGES;
      }

      // Cập nhật các trường khác đã thay đổi
      Object.keys(tourData).forEach((key) => {
        if (key !== "IMAGES") {
          currentTour[key] = tourData[key];
        }
      });

      // Lưu lại cập nhật vào cơ sở dữ liệu
      const updatedTour = await currentTour.save();
      return updatedTour;
    } catch (err) {
      console.error("Lỗi khi cập nhật tour:", err);
      throw new Error("Cập nhật tour thất bại");
    }
  }

  // Xóa tour (đánh dấu là đã bị xóa)
  async deleteTourById(tourId) {
    const result = await TourModel.findByIdAndDelete(tourId); // Xóa tour khỏi CSDL
    if (!result) {
      throw new Error("Tour không tồn tại");
    }
    return result;
  }

  //Tìm kiếm
  // async searchTour(searchParams) {
  //   const searchValue = searchParams.query; // Lấy giá trị query từ searchParams

  //   // Kiểm tra nếu không có tham số nào được truyền
  //   if (!searchValue) {
  //     console.log("Không có tham số tìm kiếm, trả về danh sách rỗng.");
  //     return { success: false, message: "Không có tham số tìm kiếm." }; // Trả về object thông báo lỗi
  //   }

  //   const query = {
  //     $or: [
  //       { TOUR_NAME: { $regex: new RegExp(searchValue, "i") } }, // Tìm kiếm không phân biệt hoa thường theo TOUR_NAME
  //       { LOCATION: { $regex: new RegExp(searchValue, "i") } }, // Tìm kiếm không phân biệt hoa thường theo LOCATION
  //     ],
  //   };

  //   try {
  //     const tours = await TourModel.find(query);
  //     if (tours.length === 0) {
  //       console.log("Không tìm thấy tour phù hợp.");
  //       return { success: false, message: "Không tìm thấy tour phù hợp." }; // Trả về object thông báo lỗi
  //     }
  //     console.log("TOURS", tours);
  //     return { success: true, data: tours }; // Trả về danh sách các tour tìm thấy
  //   } catch (error) {
  //     throw new Error("Error searching for tours: " + error.message);
  //   }
  // }
  async searchTour(searchParams) {
    const searchValue = searchParams.query; // Lấy giá trị query từ searchParams

    // Kiểm tra nếu không có tham số nào được truyền
    if (!searchValue || typeof searchValue !== "string") {
      console.log("Không có tham số tìm kiếm, trả về danh sách rỗng.");
      return { success: false, message: "Không có tham số tìm kiếm." };
    }

    const query = {
      $or: [
        { TOUR_NAME: { $regex: new RegExp(searchValue, "i") } }, // Tìm kiếm không phân biệt hoa thường theo TOUR_NAME
        { LOCATION: { $regex: new RegExp(searchValue, "i") } }, // Tìm kiếm không phân biệt hoa thường theo LOCATION
      ],
    };

    try {
      const tours = await TourModel.find(query).populate({
        path: "ID_TOUR_GUIDE_SUPERVISOR",
        select: "FULLNAME PHONE_NUMBER",
        model: "User",
      });

      console.log(tours);
      if (tours.length === 0) {
        console.log("Không tìm thấy tour phù hợp.");
        return { success: false, message: "Không tìm thấy tour phù hợp." };
      }

      console.log("TOURS", tours);
      return { success: true, data: tours }; // Trả về danh sách các tour tìm thấy
    } catch (error) {
      console.error("Error searching for tours:", error); // Ghi log lỗi
      return {
        success: false,
        message: "Lỗi khi tìm kiếm tour.",
        error: error.message,
      };
    }
  }

  // Tổng doanh thu từ tất cả các tour
  async calculateTotalRevenue() {
    try {
      const result = await BookingModel.aggregate([
        { $unwind: "$LIST_TOURS" }, // Tách mảng LIST_TOURS để tính riêng từng tour
        {
          $lookup: {
            from: "tours",
            localField: "LIST_TOURS.TOUR_ID",
            foreignField: "_id",
            as: "tourDetails",
          },
        },
        { $unwind: "$tourDetails" },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $multiply: [
                  { $toDouble: "$tourDetails.PRICE_PER_PERSON" },
                  "$LIST_TOURS.SLOT",
                ],
              },
            },
          },
        },
      ]);
      return result[0]?.totalRevenue || 0;
    } catch (error) {
      console.error("Error calculating total revenue:", error);
      throw new Error("Error calculating total revenue");
    }
  }

  // Doanh thu theo từng tour
  async calculateRevenuePerTour() {
    try {
      const result = await BookingModel.aggregate([
        { $unwind: "$LIST_TOURS" },
        {
          $lookup: {
            from: "tours",
            localField: "LIST_TOURS.TOUR_ID",
            foreignField: "_id",
            as: "tourDetails",
          },
        },
        { $unwind: "$tourDetails" },
        {
          $group: {
            _id: "$tourDetails._id",
            tourName: { $first: "$tourDetails.TOUR_NAME" },
            revenue: {
              $sum: {
                $multiply: [
                  { $toDouble: "$tourDetails.PRICE_PER_PERSON" },
                  "$LIST_TOURS.SLOT",
                ],
              },
            },
          },
        },
        { $sort: { revenue: -1 } },
      ]);
      return result;
    } catch (error) {
      console.error("Error calculating revenue per tour:", error);
      throw new Error("Error calculating revenue per tour");
    }
  }

  // Doanh thu theo loại tour
  async calculateRevenueByType() {
    try {
      const result = await BookingModel.aggregate([
        { $unwind: "$LIST_TOURS" },
        {
          $lookup: {
            from: "tours",
            localField: "LIST_TOURS.TOUR_ID",
            foreignField: "_id",
            as: "tourDetails",
          },
        },
        { $unwind: "$tourDetails" },
        {
          $group: {
            _id: "$tourDetails.TYPE",
            revenue: {
              $sum: {
                $multiply: [
                  { $toDouble: "$tourDetails.PRICE_PER_PERSON" },
                  "$LIST_TOURS.SLOT",
                ],
              },
            },
          },
        },
        { $sort: { revenue: -1 } },
      ]);
      return result;
    } catch (error) {
      console.error("Error calculating revenue by type:", error);
      throw new Error("Error calculating revenue by type");
    }
  }

  // Doanh thu theo tháng
  async calculateMonthlyRevenue() {
    try {
      const result = await BookingModel.aggregate([
        { $unwind: "$LIST_TOURS" },
        {
          $lookup: {
            from: "tours",
            localField: "LIST_TOURS.TOUR_ID",
            foreignField: "_id",
            as: "tourDetails",
          },
        },
        { $unwind: "$tourDetails" },
        {
          $group: {
            _id: { $month: "$CREATE_AT" },
            monthlyRevenue: {
              $sum: {
                $multiply: [
                  { $toDouble: "$tourDetails.PRICE_PER_PERSON" },
                  "$LIST_TOURS.SLOT",
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      return result;
    } catch (error) {
      console.error("Error calculating monthly revenue:", error);
      throw new Error("Error calculating monthly revenue");
    }
  }
  async getTopRevenueTours() {
    try {
      // Aggregation pipeline để tính doanh thu cho mỗi tour
      const revenueData = await BookingModel.aggregate([
        // Dùng unwind để truy cập từng tour trong LIST_TOURS
        { $unwind: "$LIST_TOURS" },
        // Lọc chỉ các booking có trạng thái SUCCESS
        { $match: { STATUS: "SUCCESS" } },
        {
          $group: {
            _id: "$LIST_TOURS.TOUR_ID", // Group theo TOUR_ID
            totalRevenue: {
              $sum: { $multiply: ["$LIST_TOURS.SLOT", "$TOTAL_PRICE"] }, // Tính doanh thu = Số SLOT * TOTAL_PRICE
            },
          },
        },
        // Sắp xếp theo tổng doanh thu giảm dần
        { $sort: { totalRevenue: -1 } },
        // Lấy 3 tour có doanh thu cao nhất
        { $limit: 3 },
      ]);

      // Lấy danh sách tour theo _id và thêm populate để lấy ID_TOUR_GUIDE_SUPERVISOR
      const topTours = await TourModel.find({
        _id: { $in: revenueData.map((d) => d._id) },
      }).populate({
        path: "ID_TOUR_GUIDE_SUPERVISOR",
        select: "FULLNAME PHONE_NUMBER",
      });

      // Kết hợp thông tin doanh thu vào từng tour
      const result = topTours.map((tour) => {
        const revenueInfo = revenueData.find((data) =>
          data._id.equals(tour._id)
        );
        return {
          ...tour.toObject(), // Sử dụng toObject() để chuyển đổi Mongoose document thành plain object
          totalRevenue: revenueInfo.totalRevenue,
        };
      });

      return result;
    } catch (error) {
      console.error("Error in getTopRevenueTours:", error);
      throw new Error("Lỗi khi lấy 3 tour có doanh thu cao nhất");
    }
  }

  getLatestTours = async () => {
    try {
      const tours = await TourModel.find()
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
        .limit(3) // Giới hạn lấy 3 tour
        .populate({
          path: "ID_TOUR_GUIDE_SUPERVISOR",
          select: "FULLNAME PHONE_NUMBER", // Chỉ lấy các trường cần thiết
        });
      return tours;
    } catch (error) {
      throw new Error("Không thể lấy 3 tour mới nhất");
    }
  };
}
module.exports = new TourService();
