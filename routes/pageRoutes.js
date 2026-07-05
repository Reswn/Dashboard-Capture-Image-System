const express = require("express");

const dashboardView = require("../views/dashboardView");
const testUploadView = require("../views/testUploadView");
const galleryView = require("../views/galleryView");
const docsView = require("../views/docsView");
const summaryView = require("../views/summaryView");
const statusView = require("../views/statusView");

const {
  getRecentCloudinaryUploads,
  getCloudinaryGallery,
  getCloudinarySummary,
  isCloudinaryReady,
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

const DASHBOARD_RECENT_LIMIT = 20;

/*
|--------------------------------------------------------------------------
| Helper Response HTML
|--------------------------------------------------------------------------
*/

function sendHtml(
  res,
  html,
  cacheControl = "private, no-store"
) {
  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    cacheControl
  );

  return res
    .status(200)
    .send(html);
}

/*
|--------------------------------------------------------------------------
| Status Konfigurasi
|--------------------------------------------------------------------------
*/

function getConfigStatus() {
  const cloudinaryReady =
    isCloudinaryReady();

  const deviceKeyReady =
    Boolean(
      process.env.DEVICE_SECRET_KEY
    );

  return {
    cloudinaryReady,

    deviceKeyReady,

    folder:
      CLOUDINARY_FOLDER,

    /*
     * Properti berikut tetap dipertahankan
     * agar kompatibel dengan dashboardView.js.
     *
     * Sistem sekarang tidak lagi melakukan
     * sinkronisasi metadata lokal.
     */
    syncReady:
      cloudinaryReady,

    syncMessage:
      cloudinaryReady
        ? "Data dibaca langsung dari Cloudinary."
        : "Konfigurasi Cloudinary belum lengkap.",

    lastSyncedAt:
      null,
  };
}

/*
|--------------------------------------------------------------------------
| Notifikasi Gallery
|--------------------------------------------------------------------------
*/

function getGalleryNotification(
  req
) {
  if (
    req.query.label_error
  ) {
    return {
      type:
        "error",

      message:
        String(
          req.query.label_error
        ),
    };
  }

  if (
    req.query.label_updated
  ) {
    return {
      type:
        "success",

      message:
        String(
          req.query.label_updated
        ),
    };
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Format Uptime
|--------------------------------------------------------------------------
*/

function formatUptime(
  seconds = 0
) {
  const safeSeconds =
    Number.isFinite(
      Number(seconds)
    )
      ? Math.max(
          0,
          Number(seconds)
        )
      : 0;

  const days =
    Math.floor(
      safeSeconds /
        86400
    );

  const hours =
    Math.floor(
      (
        safeSeconds %
        86400
      ) / 3600
    );

  const minutes =
    Math.floor(
      (
        safeSeconds %
        3600
      ) / 60
    );

  const secs =
    Math.floor(
      safeSeconds %
        60
    );

  if (
    days > 0
  ) {
    return (
      `${days}d ` +
      `${hours}h ` +
      `${minutes}m`
    );
  }

  if (
    hours > 0
  ) {
    return (
      `${hours}h ` +
      `${minutes}m ` +
      `${secs}s`
    );
  }

  if (
    minutes > 0
  ) {
    return (
      `${minutes}m ` +
      `${secs}s`
    );
  }

  return `${secs}s`;
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
|
| Recent capture dan summary dibaca langsung
| dari Cloudinary.
|
*/

router.get(
  "/",

  async (
    req,
    res,
    next
  ) => {
    try {
      const [
        uploads,
        summary,
      ] =
        await Promise.all([
          getRecentCloudinaryUploads(
            DASHBOARD_RECENT_LIMIT
          ),

          getCloudinarySummary(),
        ]);

      const config =
        getConfigStatus();

      return sendHtml(
        res,

        dashboardView({
          uploads,

          summary,

          config,
        }),

        /*
         * Dashboard disimpan pada cache CDN
         * selama 60 detik untuk mengurangi
         * permintaan berulang ke Cloudinary.
         */
        "public, s-maxage=60, stale-while-revalidate=300"
      );
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Upload Manual
|--------------------------------------------------------------------------
*/

router.get(
  "/test-upload",

  (
    req,
    res
  ) => {
    return sendHtml(
      res,
      testUploadView()
    );
  }
);

/*
|--------------------------------------------------------------------------
| Gallery
|--------------------------------------------------------------------------
|
| Gallery menggunakan next_cursor dari Cloudinary.
|
| Contoh URL:
|
| /gallery?limit=100&label=medis
|
| Halaman berikutnya:
|
| /gallery?cursor=NEXT_CURSOR&limit=100&label=medis
|
*/

router.get(
  "/gallery",

  async (
    req,
    res,
    next
  ) => {
    try {
      const [
        galleryResult,
        summary,
      ] =
        await Promise.all([
          getCloudinaryGallery({
            cursor:
              req.query.cursor,

            limit:
              req.query.limit,

            label:
              req.query.label ||
              "all",
          }),

          getCloudinarySummary(),
        ]);

      const notification =
        getGalleryNotification(
          req
        );

      return sendHtml(
        res,

        galleryView({
          uploads:
            galleryResult.uploads,

          summary,

          pagination:
            galleryResult.pagination,

          notification,
        }),

        /*
         * Gallery tidak menggunakan cache CDN
         * agar perubahan label dan cursor terbaru
         * langsung terlihat.
         */
        "private, no-store, max-age=0"
      );
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

router.get(
  "/summary",

  async (
    req,
    res,
    next
  ) => {
    try {
      const summary =
        await getCloudinarySummary();

      return sendHtml(
        res,

        summaryView({
          summary,
        }),

        "public, s-maxage=60, stale-while-revalidate=300"
      );
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Dokumentasi
|--------------------------------------------------------------------------
*/

router.get(
  "/docs",

  (
    req,
    res
  ) => {
    return sendHtml(
      res,

      docsView(),

      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  }
);

/*
|--------------------------------------------------------------------------
| Status Backend
|--------------------------------------------------------------------------
*/

router.get(
  "/status",

  (
    req,
    res
  ) => {
    const config = {
      deviceKeyReady:
        Boolean(
          process.env
            .DEVICE_SECRET_KEY
        ),

      cloudNameReady:
        Boolean(
          process.env
            .CLOUDINARY_CLOUD_NAME
        ),

      apiKeyReady:
        Boolean(
          process.env
            .CLOUDINARY_API_KEY
        ),

      apiSecretReady:
        Boolean(
          process.env
            .CLOUDINARY_API_SECRET
        ),

      cloudinaryReady:
        isCloudinaryReady(),

      folder:
        CLOUDINARY_FOLDER,
    };

    const server = {
      port:
        Number(
          process.env.PORT
        ) ||
        5000,

      env:
        process.env
          .NODE_ENV ||
        "development",

      uptime:
        formatUptime(
          process.uptime()
        ),

      platform:
        process.env.VERCEL ===
        "1"
          ? "vercel"
          : "local",
    };

    return sendHtml(
      res,

      statusView({
        config,

        server,
      })
    );
  }
);

module.exports = router;