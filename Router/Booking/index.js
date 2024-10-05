const express = require("express");
const router = express.Router();
const BookingController = require("../../Controllers/Booking/Booking.Controller");
const { verifyToken } = require("../../Middleware/verifyToken.js");

router.post("/booking-now", verifyToken, BookingController.bookTourNow);

module.exports = router;
