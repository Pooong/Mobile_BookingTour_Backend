const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    TOUR_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Tour",
    },
    RATING: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    COMMENT: {
      type: String,
    },
    STATUS: {
      type: Boolean,
      required: true,
    },
    CREATE_AT: {
      type: Date,
      default: Date.now,
      required: true,
    },
    UPDATE_AT: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
