require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const healthRoutes = require("./routes/healthRoutes");
const rideRoutes = require("./routes/rideRoutes");
const authRoutes = require("./routes/authRoutes");
const fuelRoutes = require("./routes/fuelRoutes");

// Pre-warm Puppeteer browser at startup (avoids cold-launch on first PDF request)
require("./services/pdfService");


const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//routes
app.use("/auth", authRoutes);
app.use("/ride", rideRoutes);
app.use("/health", healthRoutes);
app.use("/fuel", fuelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});