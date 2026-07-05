const express = require("express");

const {
  getCloudinaryGallery,
  getCloudinarySummary,
  isCloudinaryReady,
} = require("../services/cloudinaryRepository");

const formatBytes = require("../utils/formatBytes");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Konfigurasi
|--------------------------------------------------------------------------
*/

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER ||
  "skripsi_dataset_medis";

/*
|--------------------------------------------------------------------------
| API Health Check
|--------------------------------------------------------------------------
|
| Endpoint:
| GET /api/health
|
| Health check utama tetap tersedia pada:
| GET /health
|
*/

router.get(
  "/api/health",
  (req, res) => {
    const cloudinaryReady =
      isCloudinaryReady();

    const deviceKeyReady =
      Boolean(
        process.env.DEVICE_SECRET_KEY
      );

    return res.status(200).json({
      success: true,

      status: "OK",

      service:
        "ESP32-CAM Medical Dataset Backend",

      timestamp:
        new Date().toISOString(),

      environment:
        process.env.VERCEL === "1"
          ? "vercel"
          : "local",

      config: {
        cloudinary_ready:
          cloudinaryReady,

        device_key_ready:
          deviceKeyReady,

        folder:
          CLOUDINARY_FOLDER,
      },
    });
  }
);

/*
|--------------------------------------------------------------------------
| API Uploads
|--------------------------------------------------------------------------
|
| Endpoint:
| GET /api/uploads
|
| Query:
|
| cursor = cursor halaman berikutnya
| limit  = 20, 50, atau 100
| label  = all, medis, non_medis, atau unknown
|
| Contoh:
|
| /api/uploads?limit=20&label=all
|
| Halaman berikutnya:
|
| /api/uploads?cursor=NEXT_CURSOR&limit=20&label=all
|
*/

router.get(
  "/api/uploads",

  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getCloudinaryGallery({
          cursor:
            req.query.cursor,

          limit:
            req.query.limit,

          label:
            req.query.label ||
            "all",
        });

      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      return res.status(200).json({
        success: true,

        total:
          result.pagination
            .totalItems,

        count:
          result.uploads.length,

        pagination: {
          cursor:
            result.pagination
              .cursor,

          next_cursor:
            result.pagination
              .nextCursor,

          has_more:
            result.pagination
              .hasMore,

          limit:
            result.pagination
              .limit,

          label:
            result.pagination
              .selectedLabel,
        },

        data:
          result.uploads,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| API Summary
|--------------------------------------------------------------------------
|
| Endpoint:
| GET /api/summary
|
*/

router.get(
  "/api/summary",

  async (
    req,
    res,
    next
  ) => {
    try {
      const summary =
        await getCloudinarySummary();

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );

      return res.status(200).json({
        success: true,

        data: {
          total:
            Number(
              summary.total
            ) ||
            0,

          medis:
            Number(
              summary.medis
            ) ||
            0,

          non_medis:
            Number(
              summary.non_medis
            ) ||
            0,

          unknown:
            Number(
              summary.unknown
            ) ||
            0,

          total_bytes:
            Number(
              summary.total_bytes
            ) ||
            0,

          total_size_formatted:
            formatBytes(
              Number(
                summary.total_bytes
              ) ||
              0
            ),

          latest_upload:
            summary.latest_upload ||
            null,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;