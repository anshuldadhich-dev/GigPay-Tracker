const prisma = require("../config/db");

// Helper: format a ride's createdAt to IST string
const formatRide = (ride) => ({
    ...ride,
    createdAt: new Date(ride.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "medium"
    })
});

// POST /ride — create a new ride
const addRide = async (req, res) => {
    try {
        const { pickup, dropoff, fare, platform } = req.body;

        // validation
        if (!pickup || !dropoff || fare === undefined || fare === null || fare === "") {
            return res.status(400).json({
                success: false,
                message: "Pickup, dropoff and fare are required"
            });
        }

        const fareValue = parseFloat(fare);
        if (isNaN(fareValue) || fareValue < 0) {
            return res.status(400).json({
                success: false,
                message: "Fare must be a non-negative number"
            });
        }

        const ride = await prisma.ride.create({
            data: {
                pickup,
                dropoff,
                fare: fareValue,
                platform
            }
        });

        res.status(201).json({
            success: true,
            message: "Ride added successfully",
            data: formatRide(ride)
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
            data: rides.map(formatRide)
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
            data: formatRide(ride)
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
        const { pickup, dropoff, fare, platform } = req.body;

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
        if (fare !== undefined) {
            const fareValue = parseFloat(fare);
            if (isNaN(fareValue) || fareValue < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Fare must be a non-negative number"
                });
            }
            updateData.fare = fareValue;
        }
        if (platform !== undefined) updateData.platform = platform;

        const ride = await prisma.ride.update({
            where: { id: rideId },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: "Ride updated successfully",
            data: formatRide(ride)
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

// GET /ride/monthly-summary — calculate monthly stats
const getMonthlySummary = async (req, res) => {
    try {
        const now = new Date();
        const month = parseInt(req.query.month) || now.getMonth() + 1; // 1-12
        const year = parseInt(req.query.year) || now.getFullYear();

        // IST offset: UTC+5:30 = 19800000 ms
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;

        // Start of month in IST (e.g., Jun 1, 00:00 IST = May 31, 18:30 UTC)
        const startDate = new Date(Date.UTC(year, month - 1, 1) - IST_OFFSET);
        // End of month in IST (e.g., Jun 30, 23:59:59 IST = Jun 30, 18:29:59 UTC)
        const endDate = new Date(Date.UTC(year, month, 1) - IST_OFFSET - 1);

        // Aggregate: count + sum in one query
        const result = await prisma.ride.aggregate({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: { id: true },
            _sum: { fare: true }
        });

        const totalRides = result._count.id;
        const grossIncome = result._sum.fare || 0;
        const tax = grossIncome * 0.05;
        const netIncome = grossIncome - tax;

        res.status(200).json({
            success: true,
            data: {
                month,
                year,
                totalRides,
                grossIncome: Math.round(grossIncome * 100) / 100,
                tax: Math.round(tax * 100) / 100,
                netIncome: Math.round(netIncome * 100) / 100
            }
        });
    } catch (error) {
        console.error("getMonthlySummary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate monthly summary",
            error: error.message
        });
    }
};

module.exports = {
    addRide,
    getAllRides,
    getRidesById,
    updateRide,
    deleteRide,
    getMonthlySummary
};
