const express = require("express");
const router = express.Router();
const { register, login, changePassword, getProfile, updateProfile, uploadPhoto } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/register", register);
router.post("/login", login);
router.put("/change-password", protect, changePassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/photo", protect, upload.single("photo"), uploadPhoto);

module.exports = router;
