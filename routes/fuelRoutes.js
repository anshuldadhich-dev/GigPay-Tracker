const express = require("express");
const router = express.Router();
const { addFuelLog, getAllFuelLogs, deleteFuelLog } = require("../controllers/fuelController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, addFuelLog);
router.get("/", protect, getAllFuelLogs);
router.delete("/:id", protect, deleteFuelLog);

module.exports = router;
