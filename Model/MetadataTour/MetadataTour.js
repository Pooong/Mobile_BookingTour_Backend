const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetadataTourSchema = new Schema(
  {
    TOUR_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Tour",
    },
    TOTAL_BOOKINGS: {
      type: Number,
      required: true,
    },
    TOTAL_REVIEWS: {
      type: Number,
      required: true,
    },
    //số sao trung bình
    AVERAGE_RATING: {
      type: Number,
      required: true,
    },

    //số lượt boook hiện tại
    PENDING_BOOKINGS: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const MetadataTour = mongoose.model("MetadataTour", MetadataTourSchema);

module.exports = MetadataTour;
