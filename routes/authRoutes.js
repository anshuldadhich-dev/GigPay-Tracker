const express = require("express");
const router = express.Router();
const { register, login, googleLogin, changePassword, getProfile, updateProfile, uploadPhoto, deleteAccount } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.put("/change-password", protect, changePassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/photo", protect, upload.single("photo"), uploadPhoto);
router.delete("/account", protect, deleteAccount);

module.exports = router;
