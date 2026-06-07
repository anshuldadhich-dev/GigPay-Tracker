const prisma = require("../config/db");

const formatFuelLog = (log) => ({
    ...log,
    date: new Date(log.date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
    }),
    createdAt: new Date(log.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
    }),
});

// POST /fuel
const addFuelLog = async (req, res) => {
    try {
        const { date, liters, pricePerLiter, notes } = req.body;

        if (!date || liters === undefined || pricePerLiter === undefined) {
            return res.status(400).json({
                success: false,
                message: "Date, liters, and price per liter are required",
            });
        }

        const litersVal = parseFloat(liters);
        const priceVal = parseFloat(pricePerLiter);

        if (isNaN(litersVal) || litersVal <= 0 || isNaN(priceVal) || priceVal <= 0) {
            return res.status(400).json({
                success: false,
                message: "Liters and price per liter must be positive numbers",
            });
        }

        const totalCost = Math.round(litersVal * priceVal * 100) / 100;

        const log = await prisma.fuelLog.create({
            data: {
                date: new Date(date),
                liters: litersVal,
                pricePerLiter: priceVal,
                totalCost,
                notes: notes || null,
                userId: req.user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: "Fuel log added successfully",
            data: formatFuelLog(log),
        });
    } catch (error) {
        console.error("addFuelLog error:", error);
        res.status(500).json({ success: false, message: "Failed to add fuel log", error: error.message });
    }
};

// GET /fuel
const getAllFuelLogs = async (req, res) => {
    try {
        const logs = await prisma.fuelLog.findMany({
            where: { userId: req.user.id },
            orderBy: { date: "desc" },
        });

        const totalCost = logs.reduce((s, l) => s + l.totalCost, 0);
        const totalLiters = logs.reduce((s, l) => s + l.liters, 0);

        res.status(200).json({
            success: true,
            totalEntries: logs.length,
            summary: {
                totalCost: Math.round(totalCost * 100) / 100,
                totalLiters: Math.round(totalLiters * 100) / 100,
                avgPricePerLiter: totalLiters > 0 ? Math.round((totalCost / totalLiters) * 100) / 100 : 0,
            },
            data: logs.map(formatFuelLog),
        });
    } catch (error) {
        console.error("getAllFuelLogs error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch fuel logs", error: error.message });
    }
};

// DELETE /fuel/:id
const deleteFuelLog = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const existing = await prisma.fuelLog.findUnique({ where: { id } });

        if (!existing) {
            return res.status(404).json({ success: false, message: "Fuel log not found" });
        }

        if (existing.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await prisma.fuelLog.delete({ where: { id } });

        res.status(200).json({ success: true, message: "Fuel log deleted successfully" });
    } catch (error) {
        console.error("deleteFuelLog error:", error);
        res.status(500).json({ success: false, message: "Failed to delete fuel log", error: error.message });
    }
};

module.exports = { addFuelLog, getAllFuelLogs, deleteFuelLog };
