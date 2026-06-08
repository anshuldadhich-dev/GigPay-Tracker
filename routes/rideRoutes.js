const express = require("express");

const router = express.Router();

const {
    addRide,
    getAllRides,
    getRidesById,
    updateRide,
    deleteRide,
    getMonthlySummary,
    getPlatformSummary,
    generateReport,
    getEarningsSummary,
    getAnalytics,
    getFinancialSummary,
} = require("../controllers/rideController");

const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, addRide);

router.get("/", protect, getAllRides);

router.get("/monthly-summary", protect, getMonthlySummary);
router.get("/earnings-summary", protect, getEarningsSummary);
router.get("/platform-summary", protect, getPlatformSummary);
router.get("/analytics", protect, getAnalytics);
router.get("/financial-summary", protect, getFinancialSummary);
router.get("/report", protect, generateReport);

router.get("/:id", protect, getRidesById);

router.put("/:id", protect, updateRide);

router.delete("/:id", protect, deleteRide);

module.exports = router;
