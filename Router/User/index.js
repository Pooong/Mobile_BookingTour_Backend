const express = require("express");
const router = express.Router();
const USER_CONTROLLER = require("../../Controllers/User/User.Controller");
const { verifyToken } = require("../../Middleware/verifyToken");
const authorRole = require("../../Middleware/author");

router.post("/registerUser", USER_CONTROLLER.registerUser);

router.post(
  "/verifyOTPAndActivateUser",
  USER_CONTROLLER.verifyOTPAndActivateUser
);
router.post("/forgotPassword", USER_CONTROLLER.forgotPassword);
router.post("/resendOTP", USER_CONTROLLER.ResendOTP);
router.post("/resetPassword", USER_CONTROLLER.resetPassword);
router.post("/loginUser", USER_CONTROLLER.login);
router.post("/logoutUser", USER_CONTROLLER.logout);

router.post(
  "/blockUser",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER"),
  USER_CONTROLLER.blockUser
);
// router.post(
//   "/blockUser",
//   verifyToken,
//   authorRole("ADMIN", "BRANCH_MANAGER"),
//   USER_CONTROLLER.blockUser
// );

router.get("/getUsers", verifyToken, USER_CONTROLLER.getUsers);
// router.post("/updateInfoUser", verifyToken, USER_CONTROLLER.updateInfoUser);
module.exports = router;
