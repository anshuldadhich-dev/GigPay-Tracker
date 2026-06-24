const express = require("express");
const router = express.Router();
const {
  prepareMonthlyReports,
  getReportJobStatus,
  getReportJobHistory,
} = require("../controllers/reportController");

// ── Cron-secret middleware ────────────────────────────────────────────────────
const cronAuth = (req, res, next) => {
  const secret = req.headers["x-cron-secret"];

  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or missing cron secret.",
    });
  }

  next();
};

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /reports/prepare-monthly — enqueue monthly reports for all opted-in users
router.post("/prepare-monthly", cronAuth, prepareMonthlyReports);

// GET /reports/status/:id — check status of a single ReportJob
router.get("/status/:id", getReportJobStatus);

// GET /reports/history — paginated history of all report jobs
router.get("/history", getReportJobHistory);

module.exports = router;
