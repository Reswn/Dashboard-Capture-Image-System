const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pageRoutes = require("./routes/pageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const apiRoutes = require("./routes/apiRoutes");
const labelRoutes = require("./routes/labelRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend aktif",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Endpoint upload:
| POST /api/upload
|
| Endpoint koreksi label:
| POST /api/update-label
|
*/

app.use("/api", uploadRoutes);
app.use("/api", labelRoutes);

/*
 * apiRoutes tetap dipasang pada root karena kemungkinan
 * endpoint di dalam file tersebut sudah memiliki prefix /api.
 */
app.use("/", apiRoutes);

/*
|--------------------------------------------------------------------------
| Page Routes
|--------------------------------------------------------------------------
*/

app.use("/", pageRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message ||
      "Terjadi kesalahan pada server",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, "0.0.0.0", () => {
  console.log("======================================");
  console.log("ESP32-CAM Dataset Backend is running");
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Health:  http://localhost:${PORT}/health`);
  console.log(`Upload:  POST http://localhost:${PORT}/api/upload`);
  console.log(
    `Label:   POST http://localhost:${PORT}/api/update-label`
  );
  console.log(`Port:    ${PORT}`);
  console.log("======================================");
});