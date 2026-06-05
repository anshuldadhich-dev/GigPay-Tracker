const express = require("express");

const router = express.Router();

const {
    addRide,
    getAllRides,
    getRidesById,
    updateRide,
    deleteRide,
    getMonthlySummary
} = require("../controllers/rideController");

router.post("/", addRide);

router.get("/" , getAllRides);

router.get("/monthly-summary", getMonthlySummary);

router.get("/:id", getRidesById);

router.put("/:id" , updateRide);

router.delete("/:id" , deleteRide);

module.exports = router;
