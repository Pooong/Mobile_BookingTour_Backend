const express = require("express");
const router = express.Router();
const TourController = require("../../Controllers/Tour/Tour.Controller");
const { verifyToken } = require("../../Middleware/verifyToken");
const authorRole = require("../../Middleware/author");
const upload = require("../../Config/multerConfig");
// Lấy tất cả các tour
router.get("/", verifyToken, TourController.getAllTours);

// Lấy tour theo ID

// Tạo mới một tour
router.post(
  "/",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  upload,
  TourController.createTour
);

router.post(
  "/createCalendarTour",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  TourController.createCalendarTour
);
// Cập nhật tour theo ID

// Xóa tour theo ID
router.delete(
  "/:id",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  TourController.deleteTour
);
router.put(
  "/edit/:id",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  upload,
  TourController.updateTour
);
router.get("/search", verifyToken, TourController.searchTour);
router.get("/top-revenue-tours", TourController.getTopRevenueTours);
router.get("/revenue/total", TourController.getTotalRevenue);
router.get("/revenue/per-tour", TourController.getRevenuePerTour);
router.get("/revenue/by-type", TourController.getRevenueByTourType);
router.get("/revenue/monthly", TourController.getMonthlyRevenue);
router.get("/latestTours", TourController.getLatestTours);
router.get("/revenue/dailyrevenue", TourController.getDailyRevenue);

router.get("/:id", verifyToken, TourController.getTourById);

module.exports = router;
