const prisma = require("../config/db");
const { generatePDF } = require("../services/pdfService");

const getReportMonthYear = (query) => {
    const now = new Date();
    const month = parseInt(query.month) || now.getMonth() + 1;
    const year = parseInt(query.year) || now.getFullYear();

    return { month, year };
};

const getMonthDateRange = (month, year) => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const startDate = new Date(Date.UTC(year, month - 1, 1) - IST_OFFSET);
    const endDate = new Date(Date.UTC(year, month, 1) - IST_OFFSET - 1);

    return { startDate, endDate };
};

const getMonthlySummaryData = async (month, year, userId) => {
    const { startDate, endDate } = getMonthDateRange(month, year);

    const result = await prisma.ride.aggregate({
        where: {
            userId,
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

    return {
        month,
        year,
        totalRides,
        grossIncome: Math.round(grossIncome * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        netIncome: Math.round(netIncome * 100) / 100
    };
};

const getPlatformSummaryData = async (where = {}) => {
    const result = await prisma.ride.groupBy({
        by: ["platform"],
        where,
        _count: { id: true },
        _sum: { fare: true },
        orderBy: { _sum: { fare: "desc" } }
    });

    return result.map((row) => ({
        platform: row.platform || "Unknown",
        totalRides: row._count.id,
        totalEarnings: row._sum.fare || 0
    }));
};

const getRidesForReport = async (month, year, userId) => {
    const { startDate, endDate } = getMonthDateRange(month, year);

    return prisma.ride.findMany({
        where: {
            userId,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    });
};

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
                platform,
                userId: req.user.id
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
        const rides = await prisma.ride.findMany({
            where: { userId: req.user.id }
        });

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

        if (ride.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
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

        if (existing.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
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

        if (existing.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
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
        const { month, year } = getReportMonthYear(req.query);
        const data = await getMonthlySummaryData(month, year, req.user.id);

        res.status(200).json({
            success: true,
            data
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

// GET /ride/platform-summary — earnings grouped by platform
const getPlatformSummary = async (req, res) => {
    try {
        const data = await getPlatformSummaryData({ userId: req.user.id });

        res.status(200).json({
            success: true,
            totalPlatforms: data.length,
            data
        });
    } catch (error) {
        console.error("getPlatformSummary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch platform summary",
            error: error.message
        });
    }
};

// GET /ride/report — generate a downloadable monthly PDF report
const generateReport = async (req, res) => {
    try {
        const { month, year } = getReportMonthYear(req.query);
        const { startDate, endDate } = getMonthDateRange(month, year);
        const userId = req.user.id;
        const monthlySummary = await getMonthlySummaryData(month, year, userId);
        const platformSummary = await getPlatformSummaryData({
            userId,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        });
        const rides = await getRidesForReport(month, year, userId);

        const pdfBuffer = await generatePDF({
            title: "GigPay Tracker Report",
            subtitle: `Monthly report for ${month}/${year}`,
            totalEarnings: `Rs. ${monthlySummary.grossIncome}`,
            totalJobs: monthlySummary.totalRides,
            dateRange: `${month}/${year}`,
            monthlySummary,
            platformSummary,
            jobs: rides.map((ride) => ({
                client: ride.platform || "Unknown",
                title: `${ride.pickup} to ${ride.dropoff}`,
                date: new Date(ride.createdAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata"
                }),
                rawAmount: ride.fare,
                amount: `Rs. ${ride.fare}`,
                status: "Completed"
            }))
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="GigPay_Report_${month}_${year}.pdf"`
        );

        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("generateReport error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate PDF report",
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
    getMonthlySummary,
    getPlatformSummary,
    generateReport
};
