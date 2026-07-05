const express = require("express");
const multer = require("multer");

const authDevice = require("../middleware/authDevice");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const {
  invalidateCloudinaryCache,
} = require("../services/cloudinaryRepository");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Konfigurasi
|--------------------------------------------------------------------------
*/

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER ||
  "skripsi_dataset_medis";

const DATASET_TAG =
  process.env.CLOUDINARY_DATASET_TAG ||
  "dataset_limbah";

const MAX_FILE_SIZE =
  4 * 1024 * 1024;

const ALLOWED_LABELS = [
  "medis",
  "non_medis",
  "unknown",
];

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

/*
|--------------------------------------------------------------------------
| Normalisasi Label
|--------------------------------------------------------------------------
*/

function normalizeLabel(value) {
  return String(value || "medis")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/*
|--------------------------------------------------------------------------
| Normalisasi Source
|--------------------------------------------------------------------------
*/

function normalizeSource(value) {
  const normalizedSource = String(
    value || "esp32cam"
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 40);

  return normalizedSource || "esp32cam";
}

/*
|--------------------------------------------------------------------------
| Multer
|--------------------------------------------------------------------------
*/

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (req, file, callback) => {
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype
      )
    ) {
      return callback(
        new Error(
          "File harus berupa gambar JPG, JPEG, atau PNG."
        )
      );
    }

    return callback(null, true);
  },
});

/*
|--------------------------------------------------------------------------
| Upload Image
|--------------------------------------------------------------------------
|
| Endpoint:
| POST /api/upload
|
| Form-data:
| image  : file gambar
| label  : medis, non_medis, atau unknown
| source : esp32cam, web, manual, button, dan sebagainya
|
*/

router.post(
  "/upload",
  authDevice,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "File gambar tidak ditemukan. Gunakan field name image.",
        });
      }

      const label = normalizeLabel(
        req.body.label
      );

      const source = normalizeSource(
        req.body.source
      );

      if (
        !ALLOWED_LABELS.includes(label)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Label tidak valid. Gunakan medis, non_medis, atau unknown.",
        });
      }

      const capturedAt =
        new Date().toISOString();

      const timestamp =
        Date.now();

      const publicId =
        `${label}_${source}_${timestamp}`;

      /*
       * Tag lama tetap disertakan agar data masih
       * kompatibel dengan gambar yang sebelumnya
       * sudah tersimpan di Cloudinary.
       */

      const tags = [
        DATASET_TAG,
        "dataset",
        label,
        `label_${label}`,
        `source_${source}`,
      ];

      if (source === "esp32cam") {
        tags.push("esp32cam");
      }

      const result =
        await uploadToCloudinary(
          req.file.buffer,
          {
            folder:
              CLOUDINARY_FOLDER,

            public_id:
              publicId,

            resource_type:
              "image",

            format:
              "jpg",

            tags,

            context: {
              label,
              source,

              captured_at:
                capturedAt,
            },
          }
        );

      const uploadedData = {
        id:
          result.asset_id ||
          result.public_id,

        asset_id:
          result.asset_id ||
          null,

        label,

        source,

        public_id:
          result.public_id,

        secure_url:
          result.secure_url,

        image_url:
          result.secure_url,

        width:
          result.width,

        height:
          result.height,

        format:
          result.format,

        bytes:
          result.bytes,

        created_at:
          capturedAt,

        cloudinary_created_at:
          result.created_at ||
          null,

        label_updated_at:
          null,

        tags,
      };

      /*
       * Hapus cache agar gambar baru segera muncul
       * pada Dashboard dan Gallery.
       */

      invalidateCloudinaryCache();

      return res.status(201).json({
        success: true,
        message:
          "Gambar berhasil diunggah ke Cloudinary.",

        data:
          uploadedData,
      });
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Upload gambar gagal.",

        error:
          error.message ||
          "Terjadi kesalahan pada server.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Multer Error Handler
|--------------------------------------------------------------------------
*/

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(413).json({
          success: false,
          message:
            "Ukuran gambar terlalu besar. Maksimal 4 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          "Terjadi kesalahan saat menerima berkas.",

        error:
          error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message:
        "Permintaan upload tidak valid.",

      error:
        error.message ||
        "Format permintaan tidak sesuai.",
    });
  }
);

module.exports = router;