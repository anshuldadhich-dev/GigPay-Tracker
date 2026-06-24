const { Worker } = require("bullmq");
const fs = require("fs");
const path = require("path");
const os = require("os");
const connection = require("../config/redis");
const prisma = require("../config/db");
const { generatePDF } = require("../services/pdfService");
const { sendReportEmail } = require("../services/emailService");

// ── Helpers ───────────────────────────────────────────────────────────────────

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

function getMonthDateRange(month, year) {
  const startDate = new Date(Date.UTC(year, month - 1, 1) - IST_OFFSET);
  const endDate = new Date(Date.UTC(year, month, 1) - IST_OFFSET - 1);
  return { startDate, endDate };
}

function getNumber(value) {
  const num = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function fetchMonthlySummary(userId, month, year) {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const result = await prisma.ride.aggregate({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
    _sum: { fare: true },
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
    netIncome: Math.round(netIncome * 100) / 100,
  };
}

async function fetchPlatformSummary(userId, month, year) {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const result = await prisma.ride.groupBy({
    by: ["platform"],
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
    _sum: { fare: true },
    orderBy: { _sum: { fare: "desc" } },
  });

  return result.map((row) => ({
    platform: row.platform || "Unknown",
    totalRides: row._count.id,
    totalEarnings: row._sum.fare || 0,
  }));
}

async function fetchRidesForReport(userId, month, year) {
  const { startDate, endDate } = getMonthDateRange(month, year);

  return prisma.ride.findMany({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function fetchFuelCost(userId, month, year) {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const result = await prisma.fuelLog.aggregate({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    _sum: { totalCost: true },
  });

  return Math.round((result._sum.totalCost || 0) * 100) / 100;
}

async function fetchTotalWorkingHours(userId, month, year) {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const result = await prisma.shift.aggregate({
    where: {
      userId,
      status: "COMPLETED",
      startTime: { gte: startDate, lte: endDate },
    },
    _sum: { totalHours: true },
  });

  return Math.round((result._sum.totalHours || 0) * 100) / 100;
}

// ── Job processor ─────────────────────────────────────────────────────────────

async function processReportJob(job) {
  const { reportJobId, userId, email, name, month, year } = job.data;

  console.log(
    `[Worker] Processing report job #${reportJobId} — User ${userId} for ${month}/${year}`
  );

  // 1. Update status → PROCESSING
  await prisma.reportJob.update({
    where: { id: reportJobId },
    data: { status: "PROCESSING" },
  });

  // 2. Fetch user (verify user exists)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // 3. Fetch all data in parallel
  const [monthlySummary, platformSummary, rides, fuelCost, totalWorkingHours] =
    await Promise.all([
      fetchMonthlySummary(userId, month, year),
      fetchPlatformSummary(userId, month, year),
      fetchRidesForReport(userId, month, year),
      fetchFuelCost(userId, month, year),
      fetchTotalWorkingHours(userId, month, year),
    ]);

  const netEarnings = Math.round((monthlySummary.grossIncome - fuelCost) * 100) / 100;

  console.log(
    `[Worker] Report #${reportJobId} — ${monthlySummary.totalRides} rides, ` +
      `Gross: Rs.${monthlySummary.grossIncome}, Fuel: Rs.${fuelCost}, ` +
      `Net: Rs.${netEarnings}, Hours: ${totalWorkingHours}h`
  );

  // 4. Format ride data for the PDF template
  const formattedRides = rides.map((ride) => ({
    client: ride.platform || "Unknown",
    title: `${ride.pickup} to ${ride.dropoff}`,
    date: new Date(ride.createdAt).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    }),
    rawAmount: ride.fare,
    amount: `Rs. ${ride.fare}`,
    status: "Completed",
  }));

  // 5. Generate PDF using existing service
  const pdfBuffer = await generatePDF({
    title: "GigPay Tracker Report",
    subtitle: `Monthly report for ${month}/${year}`,
    totalEarnings: `Rs. ${monthlySummary.grossIncome}`,
    totalJobs: monthlySummary.totalRides,
    dateRange: `${month}/${year}`,
    monthlySummary: {
      ...monthlySummary,
      fuelCost,
      netEarnings,
      totalWorkingHours,
    },
    platformSummary,
    jobs: formattedRides,
  });

  // 6. Save PDF to temporary file
  const tmpDir = os.tmpdir();
  const pdfFileName = `gigpay_report_${userId}_${month}_${year}_${Date.now()}.pdf`;
  const pdfPath = path.join(tmpDir, pdfFileName);
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`[Worker] PDF saved to ${pdfPath}`);

  // 7. Send email with PDF attachment
  try {
    await sendReportEmail({
      to: email,
      name: name || user.name,
      month,
      year,
      pdfPath,
    });

    // 8. Success → update status to SENT
    await prisma.reportJob.update({
      where: { id: reportJobId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    console.log(`[Worker] Report #${reportJobId} sent successfully to ${email}`);
  } finally {
    // 9. Cleanup — always delete temp PDF
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`[Worker] Temp PDF deleted: ${pdfPath}`);
      }
    } catch (cleanupErr) {
      console.warn(`[Worker] Failed to delete temp PDF: ${cleanupErr.message}`);
    }
  }
}

// ── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker("monthly-report", processReportJob, {
  connection,
  concurrency: 5,
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed — Report #${job.data.reportJobId}`);
});

worker.on("failed", async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);

  // Update ReportJob status to FAILED
  if (job?.data?.reportJobId) {
    try {
      await prisma.reportJob.update({
        where: { id: job.data.reportJobId },
        data: { status: "FAILED" },
      });
    } catch (dbErr) {
      console.error(
        `[Worker] Failed to update ReportJob #${job.data.reportJobId} status:`,
        dbErr.message
      );
    }
  }
});

worker.on("error", (err) => {
  console.error("[Worker] Worker error:", err.message);
});

module.exports = worker;
