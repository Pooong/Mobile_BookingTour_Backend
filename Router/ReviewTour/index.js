const express = require("express");
const router = express.Router();
const ReviewController = require("../../Controllers/Reviews/ReviewsController");
const { verifyToken } = require("../../Middleware/verifyToken.js");
router.get("/get-reviews/:tourId", ReviewController.getReviewsByTourId);
router.post("/create-review", verifyToken, ReviewController.addReview);

module.exports = router;
