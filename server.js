const path = require("path");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const pageRoutes = require("./routes/pageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const apiRoutes = require("./routes/apiRoutes");
const labelRoutes = require("./routes/labelRoutes");

/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/

const app = express();

const PORT =
  Number(process.env.PORT) ||
  5000;

const IS_VERCEL =
  process.env.VERCEL === "1";

/*
|--------------------------------------------------------------------------
| Pengaturan Dasar
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
|
| Saat dijalankan secara lokal, folder public dilayani oleh Express.
|
| Saat dijalankan di Vercel, folder public dilayani otomatis oleh
| Vercel sehingga express.static tidak perlu digunakan.
|
*/

if (!IS_VERCEL) {
  app.use(
    express.static(
      path.join(
        __dirname,
        "public"
      )
    )
  );
}

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend aktif",

    environment:
      IS_VERCEL
        ? "vercel"
        : "local",

    timestamp:
      new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| POST /api/upload
| POST /api/update-label
| POST /api/update-labels-bulk
|
*/

app.use(
  "/api",
  uploadRoutes
);

app.use(
  "/api",
  labelRoutes
);

/*
|--------------------------------------------------------------------------
| Additional API Routes
|--------------------------------------------------------------------------
|
| apiRoutes tetap dipasang pada root karena endpoint di dalam file
| tersebut kemungkinan sudah menggunakan prefix /api.
|
*/

app.use(
  "/",
  apiRoutes
);

/*
|--------------------------------------------------------------------------
| Page Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/",
  pageRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    method: req.method,
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    const statusCode =
      Number(error.status) ||
      Number(error.statusCode) ||
      500;

    return res
      .status(statusCode)
      .json({
        success: false,

        message:
          error.message ||
          "Terjadi kesalahan pada server",
      });
  }
);

/*
|--------------------------------------------------------------------------
| Export untuk Vercel
|--------------------------------------------------------------------------
|
| Vercel akan menggunakan objek Express yang diekspor.
|
*/

module.exports = app;

/*
|--------------------------------------------------------------------------
| Menjalankan Server Lokal
|--------------------------------------------------------------------------
|
| app.listen hanya dijalankan ketika file dipanggil langsung dengan:
|
| node server.js
|
| Pada Vercel bagian ini tidak dijalankan.
|
*/

if (
  require.main === module
) {
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        "======================================"
      );

      console.log(
        "ESP32-CAM Dataset Backend is running"
      );

      console.log(
        `Local:  http://localhost:${PORT}`
      );

      console.log(
        `Health: http://localhost:${PORT}/health`
      );

      console.log(
        `Upload: POST http://localhost:${PORT}/api/upload`
      );

      console.log(
        `Label:  POST http://localhost:${PORT}/api/update-label`
      );

      console.log(
        `Port:   ${PORT}`
      );

      console.log(
        "======================================"
      );
    }
  );
}