const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateUser = require("../Middlewares/authMiddleware");
const guestController = require("../controllers/GuestController");
const otpController = require("../controllers/otpController");
const downloadController = require("../controllers/download/downloadController");

// check login
router.get("/check", authenticateUser, authController.checkLogin);

// logout
router.post("/logout", authenticateUser, authController.logout);

// get all events
router.get("/events/getEvents", guestController.getAllEvents);

// download resources
router.get("/download", authenticateUser, downloadController.downloadResource);

//auth functions
router.post("/login/adminLogin", authController.adminLogin);
router.post("/login/teacherLogin", authController.TeacherLogin);
router.post("/login/parentLogin", authController.parentLogin);
router.post("/login/studentLogin", authController.studentLogin);
// otp functionalites

router.post("/forgotpassword", otpController.sendOTP);
router.patch("/forgotpassword/check", otpController.updatePassword);
module.exports = router;
