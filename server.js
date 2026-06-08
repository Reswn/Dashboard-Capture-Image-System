const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pageRoutes = require("./routes/pageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", pageRoutes);
app.use("/", apiRoutes);
app.use("/api", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    error: error.message,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log("ESP32-CAM Dataset Backend is running");
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Port:    ${PORT}`);
  console.log("======================================");
});