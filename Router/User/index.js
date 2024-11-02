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
router.get(
  "/getAllUsers",
  verifyToken,
  authorRole("ADMIN", "BRANCH_MANAGER", "STAFF"),
  USER_CONTROLLER.getUsers
);
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
router.post("/role", verifyToken, USER_CONTROLLER.getUserByRole);
router.post("/editUser", verifyToken, USER_CONTROLLER.editUser);
router.get("/getUsers", verifyToken, USER_CONTROLLER.getUsers);
router.get("/getUserByID", verifyToken, USER_CONTROLLER.getUserById);
router.post("/profileUser", verifyToken, (req, res) => {
  return res.json(req.user);
});
module.exports = router;
