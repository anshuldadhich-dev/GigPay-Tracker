const express = require("express");
const router = express.Router();
const {
  startShift,
  endShift,
  getActiveShift,
  getShiftHistory,
  getShiftSummary,
  pauseShift,
  deleteShift,
} = require("../controllers/shiftController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/start", protect, startShift);
router.post("/end", protect, endShift);
router.get("/active", protect, getActiveShift);
router.get("/history", protect, getShiftHistory);
router.get("/summary", protect, getShiftSummary);
router.post("/pause", protect, pauseShift);
router.delete("/:id", protect, deleteShift);

module.exports = router;
