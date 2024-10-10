const express = require("express");
const router = express.Router();
const BookingController = require("../../Controllers/Booking/Booking.Controller");
const { verifyToken } = require("../../Middleware/verifyToken.js");

router.post("/booking-now", verifyToken, BookingController.bookTourNow);
router.post("/booking-nows", verifyToken, BookingController.bookTours);

module.exports = router;
