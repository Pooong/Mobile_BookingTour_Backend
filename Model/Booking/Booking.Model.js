const { required, ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Bill booking
const BookingSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    LIST_TOURS: [
      {
        TOUR_ID: {
          type: Schema.Types.ObjectId,
          ref: "Tours",
          required: true,
        },
        CALENDAR_TOUR_ID: {
          type: String,
          required: true,
        },
        START_DATE: {
          type: Date,
          required: true,
        },
        END_DATE: {
          type: Date,
          required: true,
        },
        START_TIME: {
          type: String,
          required: true,
        },
        SLOT: {
          type: Number,
          required: true,
        },
      },
    ],

    TOTAL_PRICE: {
      type: Number,
      required: true,
    },
    STATUS: {
      type: String,
      enum: ["Pending", "SUCCESS", "Cancel"],
      required: true,
    },
    BOOKING_TYPE: {
      type: String,
      enum: ["Online", "Live"],
    },
    CUSTOMER_PHONE: {
      type: String,
      required: true,
    },
    CUSTOMER_NAME: {
      type: String,
      required: true,
    },
    // CCCD/CMND
    CITIZEN_ID: {
      type: String,
      required: true,
    },

    CREATE_AT: {
      type: Date,
      default: Date.now,
      required: true,
    },
    UPDATE_AT: {
      type: Date,
    },
  },
  {
    versionKey: false,
  }
);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
