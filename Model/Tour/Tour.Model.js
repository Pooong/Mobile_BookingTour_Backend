const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MetadataTour = require("../../Model/MetadataTour/MetadataTour");

//
const CalendarTourSchema = new Schema({
  START_DATE: {
    type: Date,
    required: true,
    default: Date.now,
  },
  END_DATE: {
    type: Date,
    required: true,
    default: Date.now,
  },
  START_TIME: {
    type: String,
    required: true,
    default: "08:00",
  },
  AVAILABLE: {
    type: Boolean,
    required: true,
    default: true,
  },
  AVAILABLE_SLOTS: {
    type: Number,
    required: true,
    default: 30,
  },
  NumberOfDay: {
    type: Number,
    required: false,
    default: 3,
  },
  NumberOfNight: {
    type: Number,
    required: false,
    default: 2,
  },
});

const TourProgramSchema = new Schema({
  HOTEL: {
    type: String,
    required: true,
    default: "Khách sạn Mường Thanh.",
  },
  RESTAURANT: {
    type: String,
    required: true,
    default: "Nhà hàng Biển Đông.",
  },

  VISIT_PLACE: {
    type: [String],
    required: true,
    default: "Vịnh Hạ Long.",
  },

  VEHICLE_PERSENAL: {
    type: String,
    required: true,
    default: "Xe honda",
  },
  NOTE: {
    type: String,
    required: false,
    default: "Không có ghi chú",
  },
  _id: false, // Disable the creation of an _id field for this subdocument
});

const TourSchema = new Schema(
  {
    TOUR_NAME: {
      type: String,
      required: true,
    },
    TYPE: {
      type: String,
      //"Cruise = Du thuyền, Mountain = Núi, Sea = Biển, City = Thành phố"
      enum: ["Mountain", "Sea", "Waterfall", "Cruise", "Cave"],
      required: true,
    },
    IS_ACTIVE: {
      type: Boolean,
      default: true,
      required: true,
    },
    ID_TOUR_GUIDE_SUPERVISOR: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      // default: "66ed4a45ee69c51c9f156920",
    },

    PRICE_PER_PERSON: {
      type: String,
      required: true,
    },

    DESCRIPTION: {
      type: String,
      default: "Không có mô tả",
    },
    VEHICLE: {
      type: String,
      required: false,
      default: "Xe khách 2 tầng",
    },
    LOCATION: {
      type: String,
      required: true,
      default: "Hà Nội",
    },
    IMAGES: { type: [String] },

    CALENDAR_TOUR: {
      type: [CalendarTourSchema],
    }, // Thêm lịch trống vào schema
    AVAILABLE_SLOTS: {
      type: Number,
      required: true,
      default: 30,
    },
    //Cusom tiện nghi cho từng Tour
    CUSTOM_ATTRIBUTES: TourProgramSchema,

    //Phần trăm tiền cọc
    DEPOSIT_PERCENTAGE: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

TourSchema.post("save", async function (doc, next) {
  try {
    const newMetadataTour = new MetadataTour({
      TOUR_ID: doc._id,
      TOTAL_BOOKINGS: 0,
      TOTAL_REVIEWS: 0,
      AVERAGE_RATING: 0,
      PENDING_BOOKINGS: 0,
    });

    await newMetadataTour.save();
    next();
  } catch (error) {
    next(error);
  }
});

const Tour = mongoose.model("Tours", TourSchema);

module.exports = Tour;
