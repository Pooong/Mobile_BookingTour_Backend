const TourModel = require("../../Model/Tour/Tour.Model");
const CLOUDINARY = require("../../Config/cloudinaryConfig");
class TourService {
  // Lấy tất cả các tour
  // getAllTours = async () => {
  //   try {
  //     const tours = await TourModel.find(); // Tìm tất cả các tour trong cơ sở dữ liệu
  //     return tours; // Trả về danh sách tour
  //   } catch (error) {
  //     console.error("Error retrieving tours:", error); // In lỗi ra console
  //     throw new Error("Error retrieving tours"); // Ném lỗi với thông điệp rõ ràng
  //   }
  // };
  getAllTours = async () => {
    try {
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
      const tour = await TourModel.findById(id).lean(); // Sử dụng lean() để trả về plain object
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
          // Kiểm tra nếu là URL hoặc file path cục bộ
          if (image.startsWith("http")) {
            // Upload từ URL
            const uploadResult = await CLOUDINARY.uploader.upload(image, {
              folder: "BookingTour/Tours",
            });
            return uploadResult.secure_url;
          } else {
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
  async updateTourById(id, tourData) {
    const updatedTour = await TourModel.findByIdAndUpdate(
      id,
      { ...tourData },
      { new: true } // `new: true` trả về bản cập nhật mới nhất
    );
    return updatedTour;
  }

  // Xóa tour (đánh dấu là đã bị xóa)
  async deleteTourById(tourId) {
    const result = await TourModel.findByIdAndUpdate(
      tourId,
      { $set: { IS_DELETED: true } },
      { new: true, runValidators: true } // `new: true` để trả về tài liệu đã cập nhật
    );
    if (!result) {
      throw new Error("Tour not found");
    }
    return result.toObject();
  }

  // Lấy danh sách các tour và tìm kiếm
  async getToursAndSearch(tabStatus, page, limit, search = "") {
    let query = {};

    switch (tabStatus) {
      case "1":
        query = { STATE: true, IS_DELETED: false }; // Tour đang hoạt động
        break;
      case "2":
        query = { STATE: false, IS_DELETED: false }; // Tour không hoạt động
        break;
      case "3":
        query = { IS_DELETED: true }; // Tour bị xóa
        break;
      case "4":
        query = {}; // Tất cả tour
        break;
      default:
        throw new Error("Invalid tab status");
    }

    if (search) {
      query.$or = [
        { TOUR_NAME: { $regex: new RegExp(search, "i") } },
        { DESCRIPTION: { $regex: new RegExp(search, "i") } },
      ];
    }

    try {
      const totalCount = await TourModel.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;

      const tours = await TourModel.find(query)
        .skip(offset)
        .limit(limit)
        .lean(); // Sử dụng lean() để nhận về plain JavaScript objects

      if (tours.length === 0) {
        return {
          tours: [],
          totalPages: 0,
          totalCount: 0,
        };
      }

      return {
        tours,
        totalPages,
        totalCount,
      };
    } catch (error) {
      console.error("Error querying tours:", error);
      throw new Error("Lỗi khi truy vấn tour");
    }
  }

  // Tìm kiếm tour (có thể mở rộng thêm)
  // async searchTours(page, limit, tourName = "", location = "") {
  //   let query = { IS_DELETED: false }; // Chỉ lấy tour chưa bị xóa

  //   const andConditions = [];

  //   // Điều kiện tìm kiếm theo tên tour
  //   if (tourName) {
  //     andConditions.push({ TOUR_NAME: { $regex: new RegExp(tourName, "i") } });
  //   }

  //   // Điều kiện tìm kiếm theo vị trí
  //   if (location) {
  //     andConditions.push({ LOCATION: { $regex: new RegExp(location, "i") } });
  //   }

  //   // Kết hợp tất cả các điều kiện trong một truy vấn
  //   if (andConditions.length > 0) {
  //     query.$and = andConditions;
  //   }

  //   try {
  //     const totalCount = await TourModel.countDocuments(query);
  //     const totalPages = Math.ceil(totalCount / limit);
  //     const offset = (page - 1) * limit;

  //     const tours = await TourModel.find(query)
  //       .skip(offset)
  //       .limit(limit)
  //       .lean(); // Sử dụng lean() để nhận về plain JavaScript objects

  //     return {
  //       tours,
  //       totalPages,
  //       totalCount,
  //     };
  //   } catch (error) {
  //     console.error("Error searching tours:", error);
  //     throw new Error("Lỗi khi tìm kiếm tour");
  //   }
  // }
}

module.exports = new TourService();
