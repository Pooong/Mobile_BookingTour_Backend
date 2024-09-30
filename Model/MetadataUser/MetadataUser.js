const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetadataUserSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    TOTAL_BOOKINGS: {
      type: Number,
      required: true,
    },
    TOTAL_CANCELLATIONS: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const MetadataUser = mongoose.model("MetadataUser", MetadataUserSchema);

module.exports = MetadataUser;
