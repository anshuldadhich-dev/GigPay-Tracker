require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const healthRoutes = require("./routes/healthRoutes");
const rideRoutes = require("./routes/rideRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

//routes
app.use("/auth", authRoutes);
app.use("/ride", rideRoutes);
app.use("/health", healthRoutes);

app.listen(5000, () => {
console.log("Server runnning on port 5000");
});