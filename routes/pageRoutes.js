const express = require("express");

const dashboardView = require("../views/dashboardView");
const testUploadView = require("../views/testUploadView");
const galleryView = require("../views/galleryView");
const docsView = require("../views/docsView");
const summaryView = require("../views/summaryView");
const statusView = require("../views/statusView");

const {
  getRecentUploads,
  getUploadSummary,
} = require("../data/recentUploads");

const router = express.Router();

function getConfigStatus() {
  const cloudinaryReady =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  const deviceKeyReady = Boolean(process.env.DEVICE_SECRET_KEY);

  return {
    cloudinaryReady,
    deviceKeyReady,
    folder: process.env.CLOUDINARY_FOLDER || "skripsi_dataset_medis",
  };
}

router.get("/", (req, res) => {
  const uploads = getRecentUploads();
  const summary = getUploadSummary();

  res.setHeader("Content-Type", "text/html");

  res.send(
    dashboardView({
      uploads,
      summary,
      config: getConfigStatus(),
    })
  );
});

router.get("/test-upload", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(testUploadView());
});

router.get("/gallery", (req, res) => {
  const uploads = getRecentUploads();
  const summary = getUploadSummary();

  res.setHeader("Content-Type", "text/html");

  res.send(
    galleryView({
      uploads,
      summary,
    })
  );
});

router.get("/summary", (req, res) => {
  const summary = getUploadSummary();

  res.setHeader("Content-Type", "text/html");

  res.send(
    summaryView({
      summary,
    })
  );
});

router.get("/docs", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(docsView());
});

router.get("/status", (req, res) => {
  function formatUptime(seconds = 0) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  const config = {
    deviceKeyReady: Boolean(process.env.DEVICE_SECRET_KEY),
    cloudNameReady: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKeyReady: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretReady: Boolean(process.env.CLOUDINARY_API_SECRET),
    folder: process.env.CLOUDINARY_FOLDER || "skripsi_dataset_medis",
  };

  const server = {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
    uptime: formatUptime(process.uptime()),
  };

  res.setHeader("Content-Type", "text/html");

  res.send(
    statusView({
      config,
      server,
    })
  );
});

module.exports = router;