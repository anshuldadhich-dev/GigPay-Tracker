const express = require("express");
const router = express.Router();
const reportQueue = require("../jobs/reportQueue");

router.get("/", async (req, res) => {
  await reportQueue.add("generate-report", {
    userId: "test-user",
    month: 6,
    year: 2026,
  });

  res.json({
    success: true,
    message: "Job added to queue",
  });
});

module.exports = router;