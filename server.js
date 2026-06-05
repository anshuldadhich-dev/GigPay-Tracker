const express = require("express");

const app = express();

const healthRoutes = require("./routes/healthRoutes");
const rideRoutes = require("./routes/rideRoutes");

//middleware
app.use(express.json());

//routes
app.use("/ride", rideRoutes);
app.use("/health", healthRoutes);

app.listen(5000, () => {
console.log("Server runnning on port 5000");
});