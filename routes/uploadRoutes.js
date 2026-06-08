const express = require("express");
const multer = require("multer");

const authDevice = require("../middleware/authDevice");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const { addRecentUpload } = require("../data/recentUploads");

const router = express.Router();

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER || "skripsi_dataset_medis";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("File harus berupa gambar JPG/PNG"));
    }

    cb(null, true);
  },
});

router.post("/upload", authDevice, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File image tidak ditemukan. Gunakan field name: image",
      });
    }

    const source = req.body.source || "esp32cam";
    const label = req.body.label || "medis";

    const allowedLabels = ["medis", "non_medis", "unknown"];

    if (!allowedLabels.includes(label)) {
      return res.status(400).json({
        success: false,
        message: "Label tidak valid. Gunakan: medis, non_medis, atau unknown",
      });
    }

    const timestamp = Date.now();
    const publicId = `${label}_${source}_${timestamp}`;

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: CLOUDINARY_FOLDER,
      public_id: publicId,
      resource_type: "image",
      format: "jpg",
      tags: ["esp32cam", "dataset", label],
      context: {
        label,
        source,
        device: "esp32cam",
        captured_at: new Date().toISOString(),
      },
    });

    const uploadedData = {
      label,
      source,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
    };

    addRecentUpload(uploadedData);

    return res.status(200).json({
      success: true,
      message: "Upload berhasil",
      data: uploadedData,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Upload gagal",
      error: error.message,
    });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "Upload error",
      error: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: "Request upload tidak valid",
    error: error.message,
  });
});

module.exports = router;