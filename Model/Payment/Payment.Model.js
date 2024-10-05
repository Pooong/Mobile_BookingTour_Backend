const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    BOOKING_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Booking",
    },
    USER_ID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    PAYMENT_METHOD: {
      type: String,
      enum: ["Credit Card", "PayPal", "ZaloPay"],
      required: true,
    },
    STATUS: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      required: true,
    },
    //Tổng chưa giảm giá
    AMOUNT: {
      type: Number,
      required: false,
    },
    //số tiền phải thanh toán
    PAID: {
      type: Number,
      required: false,
    },

    //giảm giá
    DISCOUNT: {
      type: Number,
      required: false,
    },
    CREATE_AT: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
