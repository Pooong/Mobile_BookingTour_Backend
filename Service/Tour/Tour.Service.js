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
    if (!searchValue) {
      console.log("Không có tham số tìm kiếm, trả về danh sách rỗng.");
      return { success: false, message: "Không có tham số tìm kiếm." }; // Trả về object thông báo lỗi
    }

    const query = {
      $or: [
        { TOUR_NAME: { $regex: new RegExp(searchValue, "i") } }, // Tìm kiếm không phân biệt hoa thường theo TOUR_NAME
        { LOCATION: { $regex: new RegExp(searchValue, "i") } }, // Tìm kiếm không phân biệt hoa thường theo LOCATION
      ],
    };

    try {
      const tours = await TourModel.find(query).populate({
        path: "ID_TOUR_GUIDE_SUPERVISOR", // Populate trường ID_TOUR_GUIDE_SUPERVISOR
        select: "FULLNAME PHONE_NUMBER", // Chỉ lấy các trường FULLNAME và PHONE_NUMBER
        model: "User", // Model được populate là 'User'
      });

      if (tours.length === 0) {
        console.log("Không tìm thấy tour phù hợp.");
        return { success: false, message: "Không tìm thấy tour phù hợp." }; // Trả về object thông báo lỗi
      }

      console.log("TOURS", tours);
      return { success: true, data: tours }; // Trả về danh sách các tour tìm thấy
    } catch (error) {
      throw new Error("Error searching for tours: " + error.message);
    }
  }
}
module.exports = new TourService();
