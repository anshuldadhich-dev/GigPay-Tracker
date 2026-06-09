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

// GET /ride/earnings-summary — current day/week/month earned totals (IST)
const getEarningsSummary = async (req, res) => {
    try {
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const nowIST = new Date(now.getTime() + IST_OFFSET);

        // Today
        const todayStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()));
        const todayStart = new Date(todayStartIST.getTime() - IST_OFFSET);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        // This week (Mon–Sun)
        const dayOfWeek = nowIST.getUTCDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - daysFromMonday));
        const weekStart = new Date(weekStartIST.getTime() - IST_OFFSET);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

        // This month
        const monthStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1));
        const monthStart = new Date(monthStartIST.getTime() - IST_OFFSET);
        const monthEndIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() + 1, 1));
        const monthEnd = new Date(monthEndIST.getTime() - IST_OFFSET - 1);

        const [daily, weekly, monthly] = await Promise.all([
            prisma.ride.aggregate({ where: { userId: req.user.id, createdAt: { gte: todayStart, lte: todayEnd } }, _sum: { fare: true } }),
            prisma.ride.aggregate({ where: { userId: req.user.id, createdAt: { gte: weekStart, lte: weekEnd } }, _sum: { fare: true } }),
            prisma.ride.aggregate({ where: { userId: req.user.id, createdAt: { gte: monthStart, lte: monthEnd } }, _sum: { fare: true } }),
        ]);

        return res.json({
            success: true,
            data: {
                daily: Math.round((daily._sum.fare || 0) * 100) / 100,
                weekly: Math.round((weekly._sum.fare || 0) * 100) / 100,
                monthly: Math.round((monthly._sum.fare || 0) * 100) / 100,
            }
        });
    } catch (error) {
        console.error("getEarningsSummary error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch earnings summary", error: error.message });
    }
};

// GET /ride/analytics — comprehensive analytics for the analytics page
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const nowIST = new Date(now.getTime() + IST_OFFSET);

        const period = req.query.period || "month";

        const todayStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()));
        const todayStart = new Date(todayStartIST.getTime() - IST_OFFSET);

        let startDate, endDate;

        if (period === "today") {
            startDate = todayStart;
            endDate = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
        } else if (period === "week") {
            const dow = nowIST.getUTCDay();
            const daysFromMon = dow === 0 ? 6 : dow - 1;
            const weekStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - daysFromMon));
            startDate = new Date(weekStartIST.getTime() - IST_OFFSET);
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        } else if (period === "month") {
            const ms = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1));
            startDate = new Date(ms.getTime() - IST_OFFSET);
            const me = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() + 1, 1));
            endDate = new Date(me.getTime() - IST_OFFSET - 1);
        } else if (period === "3months") {
            const ms = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() - 2, 1));
            startDate = new Date(ms.getTime() - IST_OFFSET);
            endDate = now;
        } else if (period === "year") {
            const ms = new Date(Date.UTC(nowIST.getUTCFullYear(), 0, 1));
            startDate = new Date(ms.getTime() - IST_OFFSET);
            endDate = now;
        } else {
            startDate = new Date(0);
            endDate = now;
        }

        const [rides, fuelLogs, allRides, userRows] = await Promise.all([
            prisma.ride.findMany({ where: { userId, createdAt: { gte: startDate, lte: endDate } }, orderBy: { createdAt: "asc" } }),
            prisma.fuelLog.findMany({ where: { userId, date: { gte: startDate, lte: endDate } } }),
            prisma.ride.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
            prisma.$queryRaw`SELECT goal_daily, goal_weekly, goal_monthly FROM users WHERE id = ${userId}`,
        ]);
        const userGoals = userRows[0] || {};
        const user = {
            goalDaily: Number(userGoals.goal_daily) || 1500,
            goalWeekly: Number(userGoals.goal_weekly) || 8000,
            goalMonthly: Number(userGoals.goal_monthly) || 30000,
        };

        const grossIncome = rides.reduce((s, r) => s + r.fare, 0);
        const totalFuelCost = fuelLogs.reduce((s, l) => s + l.totalCost, 0);
        const profit = grossIncome - totalFuelCost;
        const profitMargin = grossIncome > 0 ? Math.round((profit / grossIncome) * 100) : 0;
        const avgPerRide = rides.length > 0 ? Math.round(grossIncome / rides.length) : 0;

        // Daily trend
        const dailyMap = {};
        rides.forEach((ride) => {
            const rIST = new Date(new Date(ride.createdAt).getTime() + IST_OFFSET);
            const key = `${rIST.getUTCFullYear()}-${String(rIST.getUTCMonth() + 1).padStart(2, "0")}-${String(rIST.getUTCDate()).padStart(2, "0")}`;
            if (!dailyMap[key]) dailyMap[key] = { date: key, earnings: 0, rides: 0 };
            dailyMap[key].earnings += ride.fare;
            dailyMap[key].rides += 1;
        });
        const dailyTrend = Object.values(dailyMap)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((d) => ({ ...d, earnings: Math.round(d.earnings * 100) / 100 }));

        // Platform breakdown
        const platformMap = {};
        rides.forEach((ride) => {
            const p = ride.platform || "Unknown";
            if (!platformMap[p]) platformMap[p] = { platform: p, earnings: 0, rides: 0 };
            platformMap[p].earnings += ride.fare;
            platformMap[p].rides += 1;
        });
        const platformBreakdown = Object.values(platformMap)
            .map((p) => ({
                ...p,
                earnings: Math.round(p.earnings * 100) / 100,
                percentage: grossIncome > 0 ? Math.round((p.earnings / grossIncome) * 100) : 0,
            }))
            .sort((a, b) => b.earnings - a.earnings);

        // Day-of-week analysis
        const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dowMap = {};
        DAY_NAMES.forEach((d, i) => { dowMap[i] = { day: d, earnings: 0, rides: 0, dayIndex: i }; });
        rides.forEach((ride) => {
            const rIST = new Date(new Date(ride.createdAt).getTime() + IST_OFFSET);
            const dow = rIST.getUTCDay();
            dowMap[dow].earnings += ride.fare;
            dowMap[dow].rides += 1;
        });
        const dayOfWeekAnalysis = Object.values(dowMap).map((d) => ({
            day: d.day,
            earnings: Math.round(d.earnings * 100) / 100,
            rides: d.rides,
            avgEarnings: d.rides > 0 ? Math.round((d.earnings / d.rides) * 100) / 100 : 0,
        }));

        // Monthly trend (last 12 months from all rides)
        const monthlyMap = {};
        allRides.forEach((ride) => {
            const rIST = new Date(new Date(ride.createdAt).getTime() + IST_OFFSET);
            const key = `${rIST.getUTCFullYear()}-${String(rIST.getUTCMonth() + 1).padStart(2, "0")}`;
            const monthName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][rIST.getUTCMonth()];
            if (!monthlyMap[key]) monthlyMap[key] = { key, month: monthName, year: rIST.getUTCFullYear(), earnings: 0, rides: 0 };
            monthlyMap[key].earnings += ride.fare;
            monthlyMap[key].rides += 1;
        });
        const monthlyTrend = Object.values(monthlyMap)
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-12)
            .map((m) => ({ ...m, earnings: Math.round(m.earnings * 100) / 100 }));

        // Goal progress — always current day/week/month
        const todayKey = `${nowIST.getUTCFullYear()}-${String(nowIST.getUTCMonth() + 1).padStart(2, "0")}-${String(nowIST.getUTCDate()).padStart(2, "0")}`;
        const todayEarnings = dailyMap[todayKey]?.earnings || 0;

        const dowNow = nowIST.getUTCDay();
        const daysFromMon = dowNow === 0 ? 6 : dowNow - 1;
        const wkStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - daysFromMon));
        const wkStart = new Date(wkStartIST.getTime() - IST_OFFSET);
        const wkEnd = new Date(wkStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        const mStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1));
        const mStart = new Date(mStartIST.getTime() - IST_OFFSET);
        const mEndIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() + 1, 1));
        const mEnd = new Date(mEndIST.getTime() - IST_OFFSET - 1);

        const [weekAgg, monthAgg] = await Promise.all([
            prisma.ride.aggregate({ where: { userId, createdAt: { gte: wkStart, lte: wkEnd } }, _sum: { fare: true } }),
            prisma.ride.aggregate({ where: { userId, createdAt: { gte: mStart, lte: mEnd } }, _sum: { fare: true } }),
        ]);

        const weeklyEarnings = weekAgg._sum.fare || 0;
        const monthlyEarnings = monthAgg._sum.fare || 0;

        const goalProgress = {
            daily: { goal: user.goalDaily, achieved: Math.round(todayEarnings * 100) / 100, percentage: user.goalDaily > 0 ? Math.min(100, Math.round((todayEarnings / user.goalDaily) * 100)) : 0 },
            weekly: { goal: user.goalWeekly, achieved: Math.round(weeklyEarnings * 100) / 100, percentage: user.goalWeekly > 0 ? Math.min(100, Math.round((weeklyEarnings / user.goalWeekly) * 100)) : 0 },
            monthly: { goal: user.goalMonthly, achieved: Math.round(monthlyEarnings * 100) / 100, percentage: user.goalMonthly > 0 ? Math.min(100, Math.round((monthlyEarnings / user.goalMonthly) * 100)) : 0 },
        };

        // Top routes
        const routeMap = {};
        rides.forEach((ride) => {
            const key = `${ride.pickup}|||${ride.dropoff}`;
            if (!routeMap[key]) routeMap[key] = { pickup: ride.pickup, dropoff: ride.dropoff, count: 0, totalEarnings: 0 };
            routeMap[key].count += 1;
            routeMap[key].totalEarnings += ride.fare;
        });
        const topRoutes = Object.values(routeMap)
            .sort((a, b) => b.count - a.count || b.totalEarnings - a.totalEarnings)
            .slice(0, 8)
            .map((r) => ({ ...r, totalEarnings: Math.round(r.totalEarnings * 100) / 100 }));

        return res.json({
            success: true,
            data: {
                period,
                overview: {
                    totalRides: rides.length,
                    grossIncome: Math.round(grossIncome * 100) / 100,
                    avgPerRide,
                    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
                    profit: Math.round(profit * 100) / 100,
                    profitMargin,
                },
                dailyTrend,
                platformBreakdown,
                dayOfWeekAnalysis,
                monthlyTrend,
                goalProgress,
                topRoutes,
            },
        });
    } catch (error) {
        console.error("getAnalytics error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch analytics", error: error.message });
    }
};

// GET /ride/financial-summary — gross / fuel / net / margin for all periods
const getFinancialSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const nowIST = new Date(now.getTime() + IST_OFFSET);

        // ── period helpers ───────────────────────────────────────────────
        const todayStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()));
        const todayStart = new Date(todayStartIST.getTime() - IST_OFFSET);
        const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        const dow = nowIST.getUTCDay();
        const daysFromMon = dow === 0 ? 6 : dow - 1;
        const weekStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate() - daysFromMon));
        const weekStart = new Date(weekStartIST.getTime() - IST_OFFSET);
        const weekEnd   = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

        const mStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1));
        const mStart    = new Date(mStartIST.getTime() - IST_OFFSET);
        const mEndIST   = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() + 1, 1));
        const mEnd      = new Date(mEndIST.getTime() - IST_OFFSET - 1);

        const pmStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() - 1, 1));
        const pmStart    = new Date(pmStartIST.getTime() - IST_OFFSET);
        const pmEndIST   = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1));
        const pmEnd      = new Date(pmEndIST.getTime() - IST_OFFSET - 1);

        // ── parallel DB queries ──────────────────────────────────────────
        const [
            allRides, monthRides, lastMonthRides, weekRides, todayRides,
            allFuel,  monthFuel,  lastMonthFuel,  weekFuel,  todayFuel,
        ] = await Promise.all([
            prisma.ride.aggregate({ where: { userId },                                              _sum: { fare: true }, _count: { id: true } }),
            prisma.ride.aggregate({ where: { userId, createdAt: { gte: mStart,    lte: mEnd   } }, _sum: { fare: true }, _count: { id: true } }),
            prisma.ride.aggregate({ where: { userId, createdAt: { gte: pmStart,   lte: pmEnd  } }, _sum: { fare: true }, _count: { id: true } }),
            prisma.ride.aggregate({ where: { userId, createdAt: { gte: weekStart, lte: weekEnd} }, _sum: { fare: true }, _count: { id: true } }),
            prisma.ride.aggregate({ where: { userId, createdAt: { gte: todayStart,lte: todayEnd}}, _sum: { fare: true }, _count: { id: true } }),
            prisma.fuelLog.aggregate({ where: { userId },                                          _sum: { totalCost: true } }),
            prisma.fuelLog.aggregate({ where: { userId, date: { gte: mStart,    lte: mEnd   } },   _sum: { totalCost: true } }),
            prisma.fuelLog.aggregate({ where: { userId, date: { gte: pmStart,   lte: pmEnd  } },   _sum: { totalCost: true } }),
            prisma.fuelLog.aggregate({ where: { userId, date: { gte: weekStart, lte: weekEnd} },   _sum: { totalCost: true } }),
            prisma.fuelLog.aggregate({ where: { userId, date: { gte: todayStart,lte: todayEnd}},   _sum: { totalCost: true } }),
        ]);

        const calc = (rideAgg, fuelAgg) => {
            const gross = Math.round((rideAgg._sum.fare || 0) * 100) / 100;
            const fuel  = Math.round((fuelAgg._sum.totalCost || 0) * 100) / 100;
            const net   = Math.round((gross - fuel) * 100) / 100;
            const margin = gross > 0 ? Math.round((net / gross) * 100 * 10) / 10 : 0;
            return { gross, fuel, net, margin, rides: rideAgg._count.id };
        };

        return res.json({
            success: true,
            data: {
                allTime:   calc(allRides,       allFuel),
                thisMonth: calc(monthRides,     monthFuel),
                lastMonth: calc(lastMonthRides, lastMonthFuel),
                thisWeek:  calc(weekRides,      weekFuel),
                today:     calc(todayRides,     todayFuel),
            },
        });
    } catch (error) {
        console.error("getFinancialSummary error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch financial summary", error: error.message });
    }
};

// DELETE /ride/all — delete all rides for the user
const clearAllRides = async (req, res) => {
    try {
        const { count } = await prisma.ride.deleteMany({ where: { userId: req.user.id } });
        return res.json({ success: true, message: `Deleted ${count} rides`, data: { count } });
    } catch (error) {
        console.error("clearAllRides error:", error);
        res.status(500).json({ success: false, message: "Failed to clear ride history", error: error.message });
    }
};

// GET /ride/export/csv — export all rides as CSV
const exportCSV = async (req, res) => {
    try {
        const rides = await prisma.ride.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });

        const rows = [
            ["ID", "Platform", "Pickup", "Dropoff", "Fare (INR)", "Date"].join(","),
            ...rides.map(r => [
                r.id,
                `"${(r.platform || "Unknown").replace(/"/g, '""')}"`,
                `"${r.pickup.replace(/"/g, '""')}"`,
                `"${r.dropoff.replace(/"/g, '""')}"`,
                r.fare,
                new Date(r.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            ].join(",")),
        ];

        const csv = rows.join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="GigPay_Rides_Export.csv"`);
        res.status(200).send(csv);
    } catch (error) {
        console.error("exportCSV error:", error);
        res.status(500).json({ success: false, message: "Failed to export CSV", error: error.message });
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
    generateReport,
    getEarningsSummary,
    getAnalytics,
    getFinancialSummary,
    clearAllRides,
    exportCSV,
};
