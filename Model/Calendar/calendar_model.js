const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TOUR_CALENDAR = new Schema({
  START_DATE: {
    type: Date,
    required: true,
  },
  END_DATE: {
    type: Date,
    required: true,
  },
  STATUS: {
    type: bool,
    required: true,
    default: true,
  },
  AVAILABLE_SLOTS: {
    type: Number,
    required: true,
    default: 30,
  },
  _id: false, // Disable the creation of an _id field for this subdocument
});

const CalendarSchema = new Schema({
  ID_TOUR: {
    type: String,
    required: true,
    ref: "Tour",
  },
  TOUR_CALENDAR: [TOUR_CALENDAR],

  _id: false, // Disable the creation of an _id field for this subdocument
});

module.exports = mongoose.model("Calendar", CalendarSchema);
