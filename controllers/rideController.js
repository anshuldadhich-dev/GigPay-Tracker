const prisma = require("../config/db");

// POST /ride — create a new ride
const addRide = async (req, res) => {
    try {
        const { pickup, dropoff, fare } = req.body;

        // validation
        if (!pickup || !dropoff || !fare) {
            return res.status(400).json({
                success: false,
                message: "Pickup, dropoff and fare are required"
            });
        }

        const ride = await prisma.ride.create({
            data: {
                pickup,
                dropoff,
                fare: parseFloat(fare)
            }
        });

        res.status(201).json({
            success: true,
            message: "Ride added successfully",
            data: ride
        });
    } catch (error) {
        console.error("addRide error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add ride",
            error: error.message
        });
    }
};

// GET /ride — fetch all rides
const getAllRides = async (req, res) => {
    try {
        const rides = await prisma.ride.findMany();

        res.status(200).json({
            success: true,
            totalRides: rides.length,
            data: rides
        });
    } catch (error) {
        console.error("getAllRides error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rides",
            error: error.message
        });
    }
};

// GET /ride/:id — fetch a single ride by ID
const getRidesById = async (req, res) => {
    try {
        const rideId = parseInt(req.params.id);

        const ride = await prisma.ride.findUnique({
            where: { id: rideId }
        });

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        res.status(200).json({
            success: true,
            data: ride
        });
    } catch (error) {
        console.error("getRidesById error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch ride",
            error: error.message
        });
    }
};

// PUT /ride/:id — update an existing ride
const updateRide = async (req, res) => {
    try {
        const rideId = parseInt(req.params.id);
        const { pickup, dropoff, fare } = req.body;

        // Check if ride exists first (findUnique returns null instead of throwing)
        const existing = await prisma.ride.findUnique({
            where: { id: rideId }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        // Build the update payload dynamically (only provided fields)
        const updateData = {};
        if (pickup !== undefined) updateData.pickup = pickup;
        if (dropoff !== undefined) updateData.dropoff = dropoff;
        if (fare !== undefined) updateData.fare = parseFloat(fare);

        const ride = await prisma.ride.update({
            where: { id: rideId },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: "Ride updated successfully",
            data: ride
        });
    } catch (error) {
        console.error("updateRide error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update ride",
            error: error.message
        });
    }
};

// DELETE /ride/:id — delete a ride
const deleteRide = async (req, res) => {
    try {
        const rideId = parseInt(req.params.id);

        // Check if ride exists first
        const existing = await prisma.ride.findUnique({
            where: { id: rideId }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        await prisma.ride.delete({
            where: { id: rideId }
        });

        res.status(200).json({
            success: true,
            message: "Ride deleted successfully"
        });
    } catch (error) {
        console.error("deleteRide error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete ride",
            error: error.message
        });
    }
};

module.exports = {
    addRide,
    getAllRides,
    getRidesById,
    updateRide,
    deleteRide
};
