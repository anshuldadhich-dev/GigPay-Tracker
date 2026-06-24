const prisma = require("../config/db");
const reportQueue = require("../jobs/reportQueue");

/**
 * POST /reports/prepare-monthly
 *
 * Enqueues one BullMQ job per user who has autoMonthlyReport enabled.
 * Inserts a ReportJob row (status = QUEUED) for each.
 *
 * PDF generation happens inside the worker — this controller only enqueues.
 */
const prepareMonthlyReports = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.body?.month) || now.getMonth() + 1;
    const year = parseInt(req.body?.year) || now.getFullYear();

    // Fetch all users with auto monthly report enabled
    const users = await prisma.user.findMany({
      where: { autoMonthlyReport: true },
      select: { id: true, email: true, name: true },
    });

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users have auto monthly report enabled.",
        jobsCreated: 0,
      });
    }

    const results = [];

    for (const user of users) {
      // Insert ReportJob row with QUEUED status
      const reportJob = await prisma.reportJob.create({
        data: {
          userId: user.id,
          month,
          year,
          status: "QUEUED",
        },
      });

      // Enqueue BullMQ job
      const queueJob = await reportQueue.add("generate-monthly-report", {
        reportJobId: reportJob.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        month,
        year,
      });

      results.push({
        reportJobId: reportJob.id,
        queueJobId: queueJob.id,
        userId: user.id,
        email: user.email,
      });
    }

    res.status(200).json({
      success: true,
      message: `Enqueued ${results.length} monthly report job(s).`,
      jobsCreated: results.length,
      month,
      year,
      data: results,
    });
  } catch (error) {
    console.error("prepareMonthlyReports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to prepare monthly reports",
      error: error.message,
    });
  }
};

/**
 * GET /reports/status/:id
 *
 * Returns the status of a single ReportJob by its database ID.
 */
const getReportJobStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const reportJob = await prisma.reportJob.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        month: true,
        year: true,
        status: true,
        createdAt: true,
        sentAt: true,
      },
    });

    if (!reportJob) {
      return res.status(404).json({
        success: false,
        message: "Report job not found.",
      });
    }

    res.status(200).json({ success: true, data: reportJob });
  } catch (error) {
    console.error("getReportJobStatus error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report job status",
      error: error.message,
    });
  }
};

/**
 * GET /reports/history
 *
 * Returns paginated report job history.
 */
const getReportJobHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.reportJob.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          month: true,
          year: true,
          status: true,
          createdAt: true,
          sentAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.reportJob.count(),
    ]);

    res.status(200).json({
      success: true,
      totalEntries: total,
      page,
      totalPages: Math.ceil(total / limit),
      data: jobs,
    });
  } catch (error) {
    console.error("getReportJobHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report job history",
      error: error.message,
    });
  }
};

module.exports = {
  prepareMonthlyReports,
  getReportJobStatus,
  getReportJobHistory,
};
