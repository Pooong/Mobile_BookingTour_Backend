const express = require("express");
const router = express.Router();
const BookingController = require("../../Controllers/Booking/Booking.Controller");
const { verifyToken } = require("../../Middleware/verifyToken.js");

router.post("/booking-now", verifyToken, BookingController.bookTourNow);
router.get("/my-booking", verifyToken, BookingController.getBookingByUserId);
router.post("/booking-nows", verifyToken, BookingController.bookTours);
router.get("/all-bookings", BookingController.getAllBookings);
router.get("/total-bookings", BookingController.getTotalBooking);
module.exports = router;
