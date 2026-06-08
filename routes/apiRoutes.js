const express = require("express");
const {
  getRecentUploads,
  getUploadSummary,
  clearRecentUploads,
} = require("../data/recentUploads");

const formatBytes = require("../utils/formatBytes");

const router = express.Router();

function checkDeviceKey(req, res, next) {
  const deviceKey = req.headers["x-device-key"];
  const serverDeviceKey = process.env.DEVICE_SECRET_KEY;

  if (!serverDeviceKey) {
    return res.status(500).json({
      success: false,
      message: "DEVICE_SECRET_KEY belum diatur di server",
    });
  }

  if (!deviceKey) {
    return res.status(401).json({
      success: false,
      message: "Header x-device-key wajib dikirim",
    });
  }

  if (deviceKey !== serverDeviceKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized device",
    });
  }

  next();
}

router.get("/health", (req, res) => {
  const cloudinaryReady =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  const deviceKeyReady = Boolean(process.env.DEVICE_SECRET_KEY);

  res.json({
    success: true,
    status: "OK",
    service: "ESP32-CAM Medical Dataset Backend",
    timestamp: new Date().toISOString(),
    config: {
      cloudinary_ready: cloudinaryReady,
      device_key_ready: deviceKeyReady,
      folder: process.env.CLOUDINARY_FOLDER || "skripsi_dataset_medis",
    },
  });
});

router.get("/api/uploads", (req, res) => {
  const uploads = getRecentUploads();

  res.json({
    success: true,
    total: uploads.length,
    data: uploads,
  });
});

router.get("/api/summary", (req, res) => {
  const summary = getUploadSummary();

  res.json({
    success: true,
    data: {
      ...summary,
      total_size_formatted: formatBytes(summary.total_bytes),
    },
  });
});

router.post("/api/clear-uploads", checkDeviceKey, (req, res) => {
  clearRecentUploads();

  res.json({
    success: true,
    message: "Metadata upload berhasil dibersihkan",
    data: {
      total: 0,
    },
  });
});

module.exports = router;