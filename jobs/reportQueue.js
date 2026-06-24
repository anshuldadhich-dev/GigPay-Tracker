const { Queue } = require("bullmq");
const connection = require("../config/redis");

const reportQueue = new Queue("monthly-report", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

module.exports = reportQueue;