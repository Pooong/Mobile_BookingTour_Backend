const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    FULLNAME: {
      type: String,
      required: false,
    },
    PHOTO_URL: {
      type: String,
      required: false,
      default:
        "https://res.cloudinary.com/dcuvwf9nx/image/upload/v1728554401/BookingTour/Tours/user-icon-1024x1024-dtzturco_ahsmp0.png",
    },
    TOUR_ID: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: false,
    },
    EMAIL: {
      type: String,
      required: true,
    },
    PHONE_NUMBER: {
      type: String,
      required: true,
    },
    PASSWORD: {
      type: String,
      required: true,
    },
    IS_ACTIVATED: {
      type: Boolean,
    },
    ROLE: {
      ADMIN: {
        type: Boolean,
        default: false, // Giá trị mặc định
      },
      BRANCH_MANAGER: {
        type: Boolean,
        default: false, // Giá trị mặc định
      },
      STAFF: {
        type: Boolean,
        default: false, // Giá trị mặc định
      },

      _id: false, // Không tạo trường _id cho subdocument
    },
    OTP: [
      {
        TYPE: {
          type: String,
        },
        CODE: {
          type: String,
        },
        TIME: {
          type: Date,
        },
        EXP_TIME: {
          type: Date,
        },
        CHECK_USING: {
          type: Boolean,
        },
      },
    ],
    ADDRESS: {
      type: String,
      required: false,
    },
    GENDER: {
      type: String,
      required: false,
    },
    IS_BLOCKED: {
      TIME: {
        type: Date,
      },
      CHECK: {
        type: Boolean,
        default: false, // Giá trị mặc định
      },
      BLOCK_BY_USER_ID: {
        type: Schema.Types.ObjectId,
      },
      _id: false, // Không tạo trường _id cho subdocument
    },
  },
  { versionKey: false } // Tắt trường __v
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
