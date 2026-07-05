const express = require("express");
const cloudinary = require("cloudinary").v2;

const dashboardView = require(
  "../views/dashboardView"
);

const testUploadView = require(
  "../views/testUploadView"
);

const galleryView = require(
  "../views/galleryView"
);

const docsView = require(
  "../views/docsView"
);

const summaryView = require(
  "../views/summaryView"
);

const statusView = require(
  "../views/statusView"
);

const {
  getRecentUploads,
  getUploadSummary,
  replaceRecentUploads,
  clearRecentUploads,
} = require(
  "../data/recentUploads"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Parser form
|--------------------------------------------------------------------------
|
| Diperlukan agar route POST seperti:
|
| - /sync-cloudinary
| - /clear-local-data
|
| dapat membaca req.body.
|
*/

router.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

/*
|--------------------------------------------------------------------------
| Konfigurasi
|--------------------------------------------------------------------------
*/

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER ||
  "skripsi_dataset_medis";

const DEFAULT_GALLERY_LIMIT =
  100;

const ALLOWED_GALLERY_LIMITS = [
  20,
  50,
  100,
];

const CLOUDINARY_TIMEOUT_MS =
  20000;

/*
 * Menyimpan status sinkronisasi terakhir
 * selama proses server masih berjalan.
 */
let lastSynchronization = {
  success: null,

  total:
    getRecentUploads().length,

  error: null,

  syncedAt: null,
};

/*
|--------------------------------------------------------------------------
| Konfigurasi Cloudinary
|--------------------------------------------------------------------------
*/

cloudinary.config({
  cloud_name:
    process.env
      .CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env
      .CLOUDINARY_API_KEY,

  api_secret:
    process.env
      .CLOUDINARY_API_SECRET,
});

/*
|--------------------------------------------------------------------------
| Helper response HTML
|--------------------------------------------------------------------------
*/

function sendHtml(
  res,
  html
) {
  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  /*
   * Mencegah browser menampilkan
   * metadata versi cache.
   */
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  res.send(html);
}

/*
|--------------------------------------------------------------------------
| Status konfigurasi
|--------------------------------------------------------------------------
*/

function getConfigStatus() {
  const cloudinaryReady =
    Boolean(
      process.env
        .CLOUDINARY_CLOUD_NAME
    ) &&
    Boolean(
      process.env
        .CLOUDINARY_API_KEY
    ) &&
    Boolean(
      process.env
        .CLOUDINARY_API_SECRET
    );

  const deviceKeyReady =
    Boolean(
      process.env
        .DEVICE_SECRET_KEY
    );

  return {
    cloudinaryReady,

    deviceKeyReady,

    folder:
      CLOUDINARY_FOLDER,
  };
}

/*
|--------------------------------------------------------------------------
| Normalisasi label
|--------------------------------------------------------------------------
*/

function normalizeLabel(
  label = ""
) {
  const value =
    String(label)
      .trim()
      .toLowerCase();

  if (
    value === "medis"
  ) {
    return "medis";
  }

  if (
    value === "non_medis" ||
    value === "non-medis" ||
    value === "non medis"
  ) {
    return "non_medis";
  }

  return null;
}

/*
 * Digunakan untuk filter dataset.
 *
 * Label yang tidak dikenali
 * dikembalikan sebagai unknown.
 */
function normalizeDatasetLabel(
  label = ""
) {
  return (
    normalizeLabel(label) ||
    "unknown"
  );
}

/*
|--------------------------------------------------------------------------
| Normalisasi filter galeri
|--------------------------------------------------------------------------
*/

function normalizeGalleryFilter(
  filter = "all"
) {
  const value =
    String(filter)
      .trim()
      .toLowerCase();

  if (
    value === "medis" ||
    value === "non_medis" ||
    value === "unknown"
  ) {
    return value;
  }

  return "all";
}

/*
|--------------------------------------------------------------------------
| Helper pagination
|--------------------------------------------------------------------------
*/

function parsePositiveInteger(
  value,
  fallback
) {
  const parsedValue =
    Number.parseInt(
      String(value || ""),
      10
    );

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue < 1
  ) {
    return fallback;
  }

  return parsedValue;
}

function parseGalleryLimit(
  value
) {
  const requestedLimit =
    parsePositiveInteger(
      value,
      DEFAULT_GALLERY_LIMIT
    );

  if (
    ALLOWED_GALLERY_LIMITS
      .includes(
        requestedLimit
      )
  ) {
    return requestedLimit;
  }

  return DEFAULT_GALLERY_LIMIT;
}

/*
|--------------------------------------------------------------------------
| Helper timeout
|--------------------------------------------------------------------------
*/

function withTimeout(
  promise,
  timeoutMs,
  timeoutMessage
) {
  let timeoutId;

  const timeoutPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {
        timeoutId =
          setTimeout(
            () => {
              reject(
                new Error(
                  timeoutMessage
                )
              );
            },
            timeoutMs
          );
      }
    );

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => {
    clearTimeout(
      timeoutId
    );
  });
}

/*
|--------------------------------------------------------------------------
| Mengambil seluruh gambar Cloudinary
|--------------------------------------------------------------------------
|
| Hanya dijalankan melalui tombol
| sinkronisasi manual.
|
*/

async function getAllCloudinaryImages() {
  const configStatus =
    getConfigStatus();

  if (
    !configStatus
      .cloudinaryReady
  ) {
    throw new Error(
      "Konfigurasi Cloudinary belum lengkap."
    );
  }

  const resources = [];

  let nextCursor;

  do {
    const options = {
      resource_type:
        "image",

      type:
        "upload",

      /*
       * Hanya mengambil gambar
       * pada folder dataset.
       */
      prefix:
        `${CLOUDINARY_FOLDER}/`,

      /*
       * Context diperlukan agar
       * actual_label ikut dibaca.
       */
      context:
        true,

      /*
       * Maksimal hasil per request
       * Cloudinary.
       */
      max_results:
        500,
    };

    if (nextCursor) {
      options.next_cursor =
        nextCursor;
    }

    const result =
      await withTimeout(
        cloudinary.api.resources(
          options
        ),

        CLOUDINARY_TIMEOUT_MS,

        "Permintaan Cloudinary melebihi batas waktu."
      );

    if (
      Array.isArray(
        result.resources
      )
    ) {
      resources.push(
        ...result.resources
      );
    }

    nextCursor =
      result.next_cursor ||
      undefined;
  } while (nextCursor);

  return resources;
}

/*
|--------------------------------------------------------------------------
| Helper public_id
|--------------------------------------------------------------------------
*/

function getFileNameFromPublicId(
  publicId = ""
) {
  return (
    String(publicId)
      .split("/")
      .pop() ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| Mendapatkan label dari public_id
|--------------------------------------------------------------------------
|
| Hanya digunakan sebagai fallback.
|
*/

function extractLabelFromPublicId(
  publicId = ""
) {
  const fileName =
    getFileNameFromPublicId(
      publicId
    ).toLowerCase();

  /*
   * Non-medis diperiksa lebih dahulu
   * karena mengandung kata medis.
   */
  if (
    fileName.startsWith(
      "non_medis_"
    ) ||
    fileName.startsWith(
      "non-medis_"
    ) ||
    fileName.startsWith(
      "non medis_"
    )
  ) {
    return "non_medis";
  }

  if (
    fileName.startsWith(
      "medis_"
    )
  ) {
    return "medis";
  }

  return "unknown";
}

/*
|--------------------------------------------------------------------------
| Mendapatkan sumber dari public_id
|--------------------------------------------------------------------------
*/

function extractSourceFromPublicId(
  publicId = ""
) {
  const fileName =
    getFileNameFromPublicId(
      publicId
    ).toLowerCase();

  if (
    fileName.includes(
      "_button_"
    )
  ) {
    return "button";
  }

  if (
    fileName.includes(
      "_manual_"
    )
  ) {
    return "manual";
  }

  if (
    fileName.includes(
      "_web_"
    )
  ) {
    return "web";
  }

  if (
    fileName.includes(
      "_test_"
    )
  ) {
    return "manual-test";
  }

  if (
    fileName.includes(
      "_esp32cam_"
    )
  ) {
    return "esp32cam";
  }

  return "esp32cam";
}

/*
|--------------------------------------------------------------------------
| Context label Cloudinary
|--------------------------------------------------------------------------
*/

function getCloudinaryContextLabel(
  cloudinaryImage = {}
) {
  return normalizeLabel(
    cloudinaryImage
      ?.context
      ?.custom
      ?.actual_label
  );
}

/*
|--------------------------------------------------------------------------
| Sinkronisasi Cloudinary dengan uploads.json
|--------------------------------------------------------------------------
*/

async function synchronizeCloudinaryData() {
  const cloudinaryImages =
    await getAllCloudinaryImages();

  const localUploads =
    getRecentUploads();

  /*
   * Proteksi agar respons kosong akibat:
   *
   * - prefix folder salah;
   * - koneksi Cloudinary bermasalah;
   * - konfigurasi folder tidak sesuai;
   *
   * tidak langsung menghapus seluruh
   * metadata lokal.
   *
   * Jika Cloudinary memang sudah kosong,
   * gunakan tombol Hapus data lokal.
   */
  if (
    cloudinaryImages.length === 0 &&
    localUploads.length > 0
  ) {
    throw new Error(
      "Cloudinary tidak mengembalikan gambar. Data lokal tidak diganti. Gunakan tombol Hapus data lokal jika seluruh file Cloudinary memang sudah dihapus."
    );
  }

  const localUploadMap =
    new Map(
      localUploads.map(
        (item) => [
          item.public_id,
          item,
        ]
      )
    );

  const synchronizedUploads =
    cloudinaryImages.map(
      (cloudinaryImage) => {
        const publicId =
          cloudinaryImage
            .public_id;

        const localData =
          localUploadMap.get(
            publicId
          );

        /*
         * Prioritas pertama:
         * label koreksi manual lokal.
         */
        const manualLocalLabel =
          localData
            ?.label_updated_at
            ? normalizeLabel(
                localData.label
              )
            : null;

        /*
         * Prioritas kedua:
         * context Cloudinary.
         */
        const cloudinaryLabel =
          getCloudinaryContextLabel(
            cloudinaryImage
          );

        /*
         * Prioritas ketiga:
         * label lokal biasa.
         */
        const localLabel =
          normalizeLabel(
            localData?.label
          );

        /*
         * Prioritas terakhir:
         * nama public_id.
         */
        const publicIdLabel =
          normalizeLabel(
            extractLabelFromPublicId(
              publicId
            )
          );

        const label =
          manualLocalLabel ||
          cloudinaryLabel ||
          localLabel ||
          publicIdLabel ||
          "unknown";

        return {
          id:
            localData?.id ||
            cloudinaryImage
              .asset_id ||
            publicId,

          label,

          source:
            localData?.source ||
            extractSourceFromPublicId(
              publicId
            ),

          public_id:
            publicId,

          secure_url:
            cloudinaryImage
              .secure_url ||
            localData
              ?.secure_url ||
            localData
              ?.image_url ||
            "",

          image_url:
            cloudinaryImage
              .secure_url ||
            localData
              ?.image_url ||
            localData
              ?.secure_url ||
            "",

          width:
            Number(
              cloudinaryImage
                .width
            ) ||
            Number(
              localData?.width
            ) ||
            null,

          height:
            Number(
              cloudinaryImage
                .height
            ) ||
            Number(
              localData?.height
            ) ||
            null,

          format:
            cloudinaryImage
              .format ||
            localData?.format ||
            "jpg",

          bytes:
            Number(
              cloudinaryImage
                .bytes
            ) ||
            Number(
              localData?.bytes
            ) ||
            0,

          created_at:
            cloudinaryImage
              .created_at ||
            localData
              ?.created_at ||
            new Date()
              .toISOString(),

          /*
           * Waktu koreksi manual
           * wajib dipertahankan.
           */
          label_updated_at:
            localData
              ?.label_updated_at ||
            null,
        };
      }
    );

  /*
   * Gambar terbaru ditempatkan
   * pada urutan paling atas.
   */
  synchronizedUploads.sort(
    (
      firstItem,
      secondItem
    ) => {
      return (
        new Date(
          secondItem.created_at
        ).getTime() -
        new Date(
          firstItem.created_at
        ).getTime()
      );
    }
  );

  replaceRecentUploads(
    synchronizedUploads
  );

  return synchronizedUploads;
}

/*
|--------------------------------------------------------------------------
| Sinkronisasi aman
|--------------------------------------------------------------------------
*/

async function safelySynchronizeCloudinary() {
  try {
    const synchronizedUploads =
      await synchronizeCloudinaryData();

    lastSynchronization = {
      success:
        true,

      total:
        synchronizedUploads
          .length,

      error:
        null,

      syncedAt:
        new Date()
          .toISOString(),
    };
  } catch (error) {
    console.error(
      "Gagal menyinkronkan data Cloudinary:",
      error.message
    );

    lastSynchronization = {
      success:
        false,

      total:
        getRecentUploads()
          .length,

      error:
        error.message ||
        "Terjadi kesalahan saat sinkronisasi Cloudinary.",

      syncedAt:
        null,
    };
  }

  return {
    ...lastSynchronization,
  };
}

/*
|--------------------------------------------------------------------------
| Notifikasi galeri
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
          req.query
            .label_error
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
          req.query
            .label_updated
        ),
    };
  }

  if (
    req.query.sync_error
  ) {
    return {
      type:
        "error",

      message:
        String(
          req.query
            .sync_error
        ),
    };
  }

  if (
    req.query.sync_success
  ) {
    return {
      type:
        "success",

      message:
        String(
          req.query
            .sync_success
        ),
    };
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Membuat pagination galeri
|--------------------------------------------------------------------------
*/

function buildGalleryPagination(
  allUploads,
  req
) {
  const selectedLabel =
    normalizeGalleryFilter(
      req.query.label
    );

  const limit =
    parseGalleryLimit(
      req.query.limit
    );

  const requestedPage =
    parsePositiveInteger(
      req.query.page,
      1
    );

  /*
   * Filter dijalankan sebelum
   * pagination.
   */
  const filteredUploads =
    selectedLabel === "all"
      ? allUploads
      : allUploads.filter(
          (item) =>
            normalizeDatasetLabel(
              item.label
            ) === selectedLabel
        );

  const totalItems =
    filteredUploads.length;

  const totalPages =
    Math.max(
      1,

      Math.ceil(
        totalItems /
        limit
      )
    );

  /*
   * Mencegah halaman melebihi
   * jumlah halaman yang tersedia.
   */
  const page =
    Math.min(
      requestedPage,
      totalPages
    );

  const startIndex =
    (page - 1) *
    limit;

  const endIndex =
    Math.min(
      startIndex +
      limit,

      totalItems
    );

  const uploads =
    filteredUploads.slice(
      startIndex,
      endIndex
    );

  return {
    uploads,

    pagination: {
      page,

      limit,

      totalItems,

      totalPages,

      selectedLabel,

      startItem:
        totalItems === 0
          ? 0
          : startIndex + 1,

      endItem:
        endIndex,

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,

      previousPage:
        page > 1
          ? page - 1
          : null,

      nextPage:
        page < totalPages
          ? page + 1
          : null,

      allowedLimits: [
        ...ALLOWED_GALLERY_LIMITS,
      ],
    },
  };
}

/*
|--------------------------------------------------------------------------
| Format uptime
|--------------------------------------------------------------------------
*/

function formatUptime(
  seconds = 0
) {
  const days =
    Math.floor(
      seconds /
      86400
    );

  const hours =
    Math.floor(
      (
        seconds %
        86400
      ) /
      3600
    );

  const minutes =
    Math.floor(
      (
        seconds %
        3600
      ) /
      60
    );

  const secs =
    Math.floor(
      seconds %
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
| Health check
|--------------------------------------------------------------------------
*/

router.get(
  "/health",

  (req, res) => {
    return res
      .status(200)
      .json({
        success:
          true,

        message:
          "Server aktif.",

        uptime_seconds:
          Math.floor(
            process.uptime()
          ),
      });
  }
);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
|
| Dashboard hanya membaca data lokal.
| Tidak melakukan sinkronisasi otomatis.
|
*/

router.get(
  "/",

  (req, res) => {
    /*
     * Dashboard hanya menampilkan
     * 12 data terbaru.
     */
    const uploads =
      getRecentUploads()
        .slice(
          0,
          15
        );

    const summary =
      getUploadSummary();

    const baseConfig =
      getConfigStatus();

    const config = {
      ...baseConfig,

      syncReady:
        lastSynchronization
          .success !== false,

      syncMessage:
        lastSynchronization
          .success === true
          ? `${lastSynchronization.total} gambar terakhir berhasil disinkronkan`
          : lastSynchronization
              .success === false
          ? `Sinkronisasi terakhir gagal: ${lastSynchronization.error}`
          : "Data lokal siap. Sinkronisasi Cloudinary dijalankan secara manual.",

      lastSyncedAt:
        lastSynchronization
          .syncedAt,
    };

    sendHtml(
      res,

      dashboardView({
        uploads,

        summary,

        config,
      })
    );
  }
);

/*
|--------------------------------------------------------------------------
| Upload manual
|--------------------------------------------------------------------------
*/

router.get(
  "/test-upload",

  (req, res) => {
    sendHtml(
      res,
      testUploadView()
    );
  }
);

/*
|--------------------------------------------------------------------------
| Galeri dengan pagination
|--------------------------------------------------------------------------
*/

router.get(
  "/gallery",

  (req, res) => {
    const allUploads =
      getRecentUploads();

    const summary =
      getUploadSummary();

    const {
      uploads,
      pagination,
    } =
      buildGalleryPagination(
        allUploads,
        req
      );

    const notification =
      getGalleryNotification(
        req
      );

    sendHtml(
      res,

      galleryView({
        uploads,

        summary,

        pagination,

        notification,
      })
    );
  }
);

/*
|--------------------------------------------------------------------------
| Sinkronisasi Cloudinary manual
|--------------------------------------------------------------------------
|
| POST /sync-cloudinary
|
*/

router.post(
  "/sync-cloudinary",

  async (req, res) => {
    const synchronization =
      await safelySynchronizeCloudinary();

    /*
     * Filter dan limit dipertahankan
     * setelah sinkronisasi.
     */
    const selectedLabel =
      normalizeGalleryFilter(
        req.body?.label ||
        req.query?.label
      );

    const limit =
      parseGalleryLimit(
        req.body?.limit ||
        req.query?.limit
      );

    const query =
      new URLSearchParams({
        page:
          "1",

        limit:
          String(limit),

        label:
          selectedLabel,
      });

    if (
      synchronization.success
    ) {
      query.set(
        "sync_success",

        `${synchronization.total} gambar berhasil disinkronkan.`
      );
    } else {
      query.set(
        "sync_error",

        `Sinkronisasi gagal. Data lokal tetap digunakan. ${synchronization.error}`
      );
    }

    return res.redirect(
      303,

      `/gallery?${query.toString()}`
    );
  }
);

/*
|--------------------------------------------------------------------------
| Menghapus seluruh metadata lokal
|--------------------------------------------------------------------------
|
| POST /clear-local-data
|
| Route ini:
|
| - menghapus seluruh isi uploads.json;
| - mengosongkan dashboard;
| - mengosongkan galeri;
| - mengosongkan summary;
| - tidak menghapus file Cloudinary.
|
*/

router.post(
  "/clear-local-data",

  (req, res) => {
    try {
      /*
       * Simpan jumlah data sebelum
       * dihapus untuk notifikasi.
       */
      const deletedCount =
        getRecentUploads()
          .length;

      /*
       * Menghapus seluruh metadata
       * melalui recentUploads.js.
       */
      clearRecentUploads();

      /*
       * Reset status sinkronisasi agar
       * dashboard tidak menampilkan
       * jumlah data lama.
       */
      lastSynchronization = {
        success:
          null,

        total:
          0,

        error:
          null,

        syncedAt:
          null,
      };

      console.log(
        "Metadata lokal berhasil dihapus:",
        {
          deleted_count:
            deletedCount,
        }
      );

      const limit =
        parseGalleryLimit(
          req.body?.limit ||
          req.query?.limit
        );

      const query =
        new URLSearchParams({
          page:
            "1",

          limit:
            String(limit),

          label:
            "all",

          sync_success:
            deletedCount > 0
              ? `${deletedCount} metadata lokal berhasil dihapus. File Cloudinary tidak terpengaruh.`
              : "Metadata lokal sudah kosong.",
        });

      return res.redirect(
        303,

        `/gallery?${query.toString()}`
      );
    } catch (error) {
      console.error(
        "Gagal menghapus metadata lokal:",
        error
      );

      const query =
        new URLSearchParams({
          page:
            "1",

          limit:
            String(
              DEFAULT_GALLERY_LIMIT
            ),

          label:
            "all",

          sync_error:
            error.message ||
            "Metadata lokal gagal dihapus.",
        });

      return res.redirect(
        303,

        `/gallery?${query.toString()}`
      );
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

  (req, res) => {
    const summary =
      getUploadSummary();

    sendHtml(
      res,

      summaryView({
        summary,
      })
    );
  }
);

/*
|--------------------------------------------------------------------------
| Dokumentasi
|--------------------------------------------------------------------------
*/

router.get(
  "/docs",

  (req, res) => {
    sendHtml(
      res,
      docsView()
    );
  }
);

/*
|--------------------------------------------------------------------------
| Status backend
|--------------------------------------------------------------------------
*/

router.get(
  "/status",

  (req, res) => {
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

      folder:
        CLOUDINARY_FOLDER,
    };

    const server = {
      port:
        process.env.PORT ||
        5000,

      env:
        process.env
          .NODE_ENV ||
        "development",

      uptime:
        formatUptime(
          process.uptime()
        ),
    };

    sendHtml(
      res,

      statusView({
        config,

        server,
      })
    );
  }
);

module.exports = router;

