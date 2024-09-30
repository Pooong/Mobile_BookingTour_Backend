const express = require("express");
const router = express.Router();
const TourController = require("../../Controllers/Tour/Tour.Controller");
const { verifyToken } = require("../../Middleware/verifyToken");
const authorRole = require("../../Middleware/author");

// Lấy tất cả các tour
router.get("/", verifyToken, TourController.getAllTours);

// Lấy tour theo ID
router.get("/:id", verifyToken, TourController.getTourById);

// Tạo mới một tour
router.post(
  "/",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  TourController.createTour
);

router.post(
  "/createCalendarTour",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  TourController.createCalendarTour
);
// Cập nhật tour theo ID
router.put(
  "/:id",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  TourController.updateTour
);

// Xóa tour theo ID
router.delete(
  "/:id",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  TourController.deleteTour
);
router.post("/search", verifyToken, TourController.searchTours);

module.exports = router;
