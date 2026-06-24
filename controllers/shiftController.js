const prisma = require("../config/db");

const AUTO_END_HOURS = 17;

// ── Helpers ──

const formatShift = (shift) => ({
  ...shift,
  date: new Date(shift.date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  }),
  startTime: shift.startTime.toISOString(),
  endTime: shift.endTime ? shift.endTime.toISOString() : null,
  pausedAt: shift.pausedAt ? shift.pausedAt.toISOString() : null,
  createdAt: new Date(shift.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }),
});

const getActiveShiftMs = (shift) => {
  const now = new Date();
  const elapsed = now.getTime() - new Date(shift.startTime).getTime();
  const pausedMs = shift.totalPausedMinutes * 60 * 1000;
  if (shift.pausedAt) {
    const sincePause = now.getTime() - new Date(shift.pausedAt).getTime();
    return elapsed - pausedMs - sincePause;
  }
  return elapsed - pausedMs;
};

const isOverAutoEnd = (shift) => {
  const activeMs = getActiveShiftMs(shift);
  return activeMs > AUTO_END_HOURS * 60 * 60 * 1000;
};

const calculateShiftTotals = async (shift, endTimeOverride) => {
  const now = endTimeOverride || new Date();
  const startTime = new Date(shift.startTime);
  const endTime = now;

  // Total active hours (excluding paused time)
  const totalMs = endTime.getTime() - startTime.getTime();
  const pausedMs = shift.totalPausedMinutes * 60 * 1000;
  const activeMs = totalMs - pausedMs;
  const totalHours = Math.round((activeMs / (1000 * 60 * 60)) * 100) / 100;

  // Total distance
  let totalDistance = null;
  if (shift.startOdometer != null && shift.endOdometer != null) {
    totalDistance = Math.round((shift.endOdometer - shift.startOdometer) * 100) / 100;
  }

  // Total earnings from rides during shift
  const rideAgg = await prisma.ride.aggregate({
    where: {
      userId: shift.userId,
      createdAt: { gte: startTime, lte: endTime },
    },
    _sum: { fare: true },
  });
  const totalEarnings = rideAgg._sum.fare ? Math.round(rideAgg._sum.fare * 100) / 100 : 0;

  // Fuel cost from fuel logs during shift date range
  const fuelAgg = await prisma.fuelLog.aggregate({
    where: {
      userId: shift.userId,
      date: {
        gte: new Date(startTime.toISOString().split("T")[0]),
        lte: endTime,
      },
    },
    _sum: { totalCost: true },
  });
  const fuelCost = fuelAgg._sum.totalCost ? Math.round(fuelAgg._sum.totalCost * 100) / 100 : 0;

  // Profit
  const profit = Math.round((totalEarnings - fuelCost) * 100) / 100;

  // Rides completed count
  const ridesCount = await prisma.ride.count({
    where: {
      userId: shift.userId,
      createdAt: { gte: startTime, lte: endTime },
    },
  });

  return { totalHours, totalDistance, totalEarnings, fuelCost, profit, ridesCount, endTime: now };
};

// ── POST /shift/start ──
const startShift = async (req, res) => {
  try {
    const { platforms, startOdometer, date } = req.body;

    // Check for existing active/paused shift
    const existing = await prisma.shift.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have an active shift. End it before starting a new one.",
        data: { activeShiftId: existing.id },
      });
    }

    const shiftDate = date ? new Date(date) : new Date();
    shiftDate.setHours(0, 0, 0, 0);

    const shift = await prisma.shift.create({
      data: {
        userId: req.user.id,
        date: shiftDate,
        startTime: new Date(),
        startOdometer: startOdometer ? parseFloat(startOdometer) : null,
        platforms: platforms || null,
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      success: true,
      message: "Shift started successfully",
      data: formatShift(shift),
    });
  } catch (error) {
    console.error("startShift error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to start shift", error: error.message });
  }
};

// ── POST /shift/end ──
const endShift = async (req, res) => {
  try {
    const { endOdometer } = req.body;

    const shift = await prisma.shift.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "No active shift found. Start a shift first.",
      });
    }

    // If paused, finalize paused time before ending
    let totalPausedMinutes = shift.totalPausedMinutes;
    if (shift.pausedAt) {
      const sincePause = (new Date().getTime() - new Date(shift.pausedAt).getTime()) / (1000 * 60);
      totalPausedMinutes += sincePause;
    }

    // Prepare shift data for calculation
    const shiftData = {
      ...shift,
      endOdometer: endOdometer ? parseFloat(endOdometer) : shift.endOdometer,
      totalPausedMinutes,
    };

    const { totalHours, totalDistance, totalEarnings, fuelCost, profit } =
      await calculateShiftTotals(shiftData);

    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: {
        endTime: new Date(),
        endOdometer: shiftData.endOdometer,
        totalHours,
        totalDistance,
        totalEarnings,
        fuelCost,
        profit,
        status: "COMPLETED",
        totalPausedMinutes,
        pausedAt: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Shift ended successfully",
      data: formatShift(updated),
    });
  } catch (error) {
    console.error("endShift error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to end shift", error: error.message });
  }
};

// ── GET /shift/active ──
const getActiveShift = async (req, res) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (!shift) {
      return res.status(200).json({
        success: true,
        data: { active: null },
      });
    }

    // Auto-end check: if running >17 hours, auto-close
    if (shift.status === "ACTIVE" && isOverAutoEnd(shift)) {
      const endTime = new Date(new Date(shift.startTime).getTime() + AUTO_END_HOURS * 60 * 60 * 1000);
      const shiftData = { ...shift, endOdometer: shift.endOdometer, endTime };
      const { totalHours, totalDistance, totalEarnings, fuelCost, profit } =
        await calculateShiftTotals(shiftData, endTime);

      const autoEnded = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          endTime,
          totalHours,
          totalDistance,
          totalEarnings,
          fuelCost,
          profit,
          status: "COMPLETED",
          autoEnded: true,
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          active: null,
          autoEnded: {
            shift: formatShift(autoEnded),
            reason: `Shift auto-ended after ${AUTO_END_HOURS} hours`,
          },
        },
      });
    }

    // Live shift — fetch current earnings + rides count
    const now = new Date();
    const startTime = new Date(shift.startTime);

    const rideAgg = await prisma.ride.aggregate({
      where: {
        userId: req.user.id,
        createdAt: { gte: startTime, lte: now },
      },
      _sum: { fare: true },
      _count: true,
    });

    const liveEarnings = rideAgg._sum.fare ? Math.round(rideAgg._sum.fare * 100) / 100 : 0;
    const ridesCompleted = rideAgg._count;

    // Calculate elapsed ms excluding paused time
    const elapsedMs = getActiveShiftMs(shift);
    const elapsedSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);

    res.status(200).json({
      success: true,
      data: {
        active: {
          ...formatShift(shift),
          liveEarnings,
          ridesCompleted,
          elapsedSeconds,
          isPaused: shift.status === "PAUSED",
        },
      },
    });
  } catch (error) {
    console.error("getActiveShift error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch active shift", error: error.message });
  }
};

// ── GET /shift/history ──
const getShiftHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where: {
          userId: req.user.id,
          status: "COMPLETED",
        },
        orderBy: { startTime: "desc" },
        skip,
        take: limit,
      }),
      prisma.shift.count({
        where: {
          userId: req.user.id,
          status: "COMPLETED",
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      totalEntries: total,
      page,
      totalPages: Math.ceil(total / limit),
      data: shifts.map(formatShift),
    });
  } catch (error) {
    console.error("getShiftHistory error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch shift history", error: error.message });
  }
};

// ── GET /shift/summary ──
const getShiftSummary = async (req, res) => {
  try {
    // Weekly stats (current week Monday-Sunday in IST)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklyShifts = await prisma.shift.findMany({
      where: {
        userId: req.user.id,
        status: "COMPLETED",
        startTime: { gte: monday, lte: sunday },
      },
    });

    const totalWeeklyHours = weeklyShifts.reduce((s, sh) => s + (sh.totalHours || 0), 0);
    const totalWeeklyEarnings = weeklyShifts.reduce((s, sh) => s + (sh.totalEarnings || 0), 0);
    const totalWeeklyShifts = weeklyShifts.length;

    const avgEarningsPerHour =
      totalWeeklyHours > 0
        ? Math.round((totalWeeklyEarnings / totalWeeklyHours) * 100) / 100
        : 0;

    // Best earning day this week
    const byDay = {};
    weeklyShifts.forEach((sh) => {
      const day = new Date(sh.startTime).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
      });
      byDay[day] = (byDay[day] || 0) + (sh.totalEarnings || 0);
    });

    let bestEarningDay = null;
    let bestEarningAmount = 0;
    Object.entries(byDay).forEach(([day, amount]) => {
      if (amount > bestEarningAmount) {
        bestEarningDay = day;
        bestEarningAmount = Math.round(amount * 100) / 100;
      }
    });

    // Lifetime totals
    const lifetimeAgg = await prisma.shift.aggregate({
      where: {
        userId: req.user.id,
        status: "COMPLETED",
      },
      _sum: {
        totalHours: true,
        totalEarnings: true,
        totalDistance: true,
        profit: true,
      },
      _count: true,
    });

    res.status(200).json({
      success: true,
      data: {
        weekly: {
          totalHours: Math.round(totalWeeklyHours * 100) / 100,
          totalEarnings: Math.round(totalWeeklyEarnings * 100) / 100,
          totalShifts: totalWeeklyShifts,
          avgEarningsPerHour,
          bestEarningDay: bestEarningDay
            ? { day: bestEarningDay, amount: bestEarningAmount }
            : null,
        },
        lifetime: {
          totalShifts: lifetimeAgg._count,
          totalHours: lifetimeAgg._sum.totalHours
            ? Math.round(lifetimeAgg._sum.totalHours * 100) / 100
            : 0,
          totalEarnings: lifetimeAgg._sum.totalEarnings
            ? Math.round(lifetimeAgg._sum.totalEarnings * 100) / 100
            : 0,
          totalDistance: lifetimeAgg._sum.totalDistance
            ? Math.round(lifetimeAgg._sum.totalDistance * 100) / 100
            : 0,
          totalProfit: lifetimeAgg._sum.profit
            ? Math.round(lifetimeAgg._sum.profit * 100) / 100
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("getShiftSummary error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch shift summary", error: error.message });
  }
};

// ── POST /shift/pause ──
const pauseShift = async (req, res) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "No active shift found to pause/resume.",
      });
    }

    let updated;
    if (shift.status === "ACTIVE") {
      // Pause the shift
      updated = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          status: "PAUSED",
          pausedAt: new Date(),
        },
      });
    } else {
      // Resume — calculate paused time and add to total
      const sincePause = shift.pausedAt
        ? (new Date().getTime() - new Date(shift.pausedAt).getTime()) / (1000 * 60)
        : 0;
      updated = await prisma.shift.update({
        where: { id: shift.id },
        data: {
          status: "ACTIVE",
          totalPausedMinutes: shift.totalPausedMinutes + sincePause,
          pausedAt: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: updated.status === "PAUSED" ? "Shift paused" : "Shift resumed",
      data: formatShift(updated),
    });
  } catch (error) {
    console.error("pauseShift error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to toggle pause", error: error.message });
  }
};

// ── DELETE /shift/:id ──
const deleteShift = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const shift = await prisma.shift.findUnique({ where: { id } });

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    if (shift.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await prisma.shift.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Shift deleted successfully" });
  } catch (error) {
    console.error("deleteShift error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete shift", error: error.message });
  }
};

module.exports = {
  startShift,
  endShift,
  getActiveShift,
  getShiftHistory,
  getShiftSummary,
  pauseShift,
  deleteShift,
};
