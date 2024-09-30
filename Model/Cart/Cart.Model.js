const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: false, // Bắt buộc có USER_ID
      ref: "User", // Tham chiếu đến collection User
    },
    LIST_TOUR_REF: [
      {
        _id: false,
        TOUR_ID: {
          type: Schema.Types.ObjectId,
          required: false, // Bắt buộc có TOUR_ID
          ref: "Tour", // Tham chiếu đến collection Tour
        },
        START_DATE: {
          type: Date,
          required: true,
        },
        END_DATE: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true, // Tự động thêm CREATE_AT và UPDATE_AT
  }
);

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;