const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;
const UPLOADS_FILE = path.join(DATA_DIR, "uploads.json");
const MAX_RECENT_UPLOADS = 100;

let recentUploads = loadUploadsFromFile();

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(UPLOADS_FILE)) {
    fs.writeFileSync(UPLOADS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function loadUploadsFromFile() {
  try {
    ensureDataFile();

    const fileContent = fs.readFileSync(UPLOADS_FILE, "utf-8");
    const parsedData = JSON.parse(fileContent);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData;
  } catch (error) {
    console.error("Gagal membaca uploads.json:", error.message);
    return [];
  }
}

function saveUploadsToFile() {
  try {
    ensureDataFile();

    fs.writeFileSync(
      UPLOADS_FILE,
      JSON.stringify(recentUploads, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Gagal menyimpan uploads.json:", error.message);
  }
}

function normalizeUploadData(uploadData = {}) {
  return {
    id: uploadData.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    label: uploadData.label || "unknown",
    source: uploadData.source || "esp32cam",
    public_id: uploadData.public_id || "-",
    secure_url: uploadData.secure_url || "",
    width: uploadData.width || null,
    height: uploadData.height || null,
    format: uploadData.format || "jpg",
    bytes: uploadData.bytes || 0,
    created_at: uploadData.created_at || new Date().toISOString(),
  };
}

function addRecentUpload(uploadData) {
  const normalizedData = normalizeUploadData(uploadData);

  recentUploads.unshift(normalizedData);

  if (recentUploads.length > MAX_RECENT_UPLOADS) {
    recentUploads = recentUploads.slice(0, MAX_RECENT_UPLOADS);
  }

  saveUploadsToFile();

  return normalizedData;
}

function getRecentUploads() {
  return recentUploads;
}

function getUploadSummary() {
  const total = recentUploads.length;

  const medis = recentUploads.filter((item) => item.label === "medis").length;

  const nonMedis = recentUploads.filter(
    (item) => item.label === "non_medis"
  ).length;

  const unknown = recentUploads.filter(
    (item) => item.label === "unknown"
  ).length;

  const totalBytes = recentUploads.reduce((sum, item) => {
    return sum + (Number(item.bytes) || 0);
  }, 0);

  return {
    total,
    medis,
    non_medis: nonMedis,
    unknown,
    total_bytes: totalBytes,
    latest_upload: recentUploads[0] || null,
  };
}

function clearRecentUploads() {
  recentUploads = [];
  saveUploadsToFile();

  return recentUploads;
}

module.exports = {
  addRecentUpload,
  getRecentUploads,
  getUploadSummary,
  clearRecentUploads,
};