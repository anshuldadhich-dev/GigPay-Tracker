const express = require("express");
const router = express.Router();

const {
checkHealth
} = require("../controllers/healthControllers");

router.get("/", checkHealth);
module.exports = router;