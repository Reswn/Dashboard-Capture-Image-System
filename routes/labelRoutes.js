
const express = require("express");
const cloudinary = require("cloudinary").v2;

const {
  updateUploadLabel,
  updateMultipleUploadLabels,
} = require("../data/recentUploads");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Konfigurasi
|--------------------------------------------------------------------------
*/

const MAX_BULK_ITEMS = 3000;
const CLOUDINARY_BATCH_SIZE = 100;

/*
|--------------------------------------------------------------------------
| Cloudinary
|--------------------------------------------------------------------------
*/

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

/*
|--------------------------------------------------------------------------
| Helper label
|--------------------------------------------------------------------------
*/

function normalizeLabel(label = "") {
  const value = String(label)
    .trim()
    .toLowerCase();

  if (value === "medis") {
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
|--------------------------------------------------------------------------
| Helper public_id
|--------------------------------------------------------------------------
*/

function normalizePublicId(publicId = "") {
  return String(publicId)
    .trim();
}

function normalizePublicIds(
  publicIds = []
) {
  /*
   * Mendukung:
   *
   * public_ids: ["id-1", "id-2"]
   *
   * maupun:
   *
   * public_ids: "id-1"
   */
  const values =
    Array.isArray(publicIds)
      ? publicIds
      : [publicIds];

  return Array.from(
    new Set(
      values
        .map((publicId) =>
          normalizePublicId(
            publicId
          )
        )
        .filter(Boolean)
    )
  );
}

/*
|--------------------------------------------------------------------------
| Status Cloudinary
|--------------------------------------------------------------------------
*/

function isCloudinaryReady() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/*
|--------------------------------------------------------------------------
| Membagi array menjadi beberapa batch
|--------------------------------------------------------------------------
*/

function splitIntoBatches(
  items = [],
  batchSize = 100
) {
  const batches = [];

  for (
    let index = 0;
    index < items.length;
    index += batchSize
  ) {
    batches.push(
      items.slice(
        index,
        index + batchSize
      )
    );
  }

  return batches;
}

/*
|--------------------------------------------------------------------------
| Menyimpan context Cloudinary
|--------------------------------------------------------------------------
*/

function saveContextToCloudinary(
  publicIds,
  label
) {
  return new Promise(
    (resolve, reject) => {
      cloudinary.uploader.add_context(
        `actual_label=${label}`,
        publicIds,
        {
          resource_type: "image",
          type: "upload",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| Sinkronisasi banyak label ke Cloudinary
|--------------------------------------------------------------------------
|
| Public ID dibagi per 100 data agar request tidak terlalu besar.
|
| Jika salah satu batch gagal, batch lainnya tetap dilanjutkan.
|
*/

async function synchronizeLabelsToCloudinary(
  publicIds,
  label
) {
  const normalizedPublicIds =
    normalizePublicIds(
      publicIds
    );

  if (!isCloudinaryReady()) {
    return {
      success: false,

      total_requested:
        normalizedPublicIds.length,

      synced_count: 0,

      failed_count:
        normalizedPublicIds.length,

      successful_batches: 0,

      failed_batches: 0,

      errors: [
        "Konfigurasi Cloudinary belum lengkap.",
      ],
    };
  }

  if (
    normalizedPublicIds.length === 0
  ) {
    return {
      success: true,

      total_requested: 0,

      synced_count: 0,

      failed_count: 0,

      successful_batches: 0,

      failed_batches: 0,

      errors: [],
    };
  }

  const batches =
    splitIntoBatches(
      normalizedPublicIds,

      CLOUDINARY_BATCH_SIZE
    );

  let syncedCount = 0;
  let failedCount = 0;

  let successfulBatches = 0;
  let failedBatches = 0;

  const errors = [];

  for (
    let index = 0;
    index < batches.length;
    index += 1
  ) {
    const batch =
      batches[index];

    try {
      console.log(
        `Memproses Cloudinary batch ${
          index + 1
        }/${batches.length}:`,
        `${batch.length} gambar`
      );

      await saveContextToCloudinary(
        batch,
        label
      );

      syncedCount +=
        batch.length;

      successfulBatches += 1;
    } catch (error) {
      failedCount +=
        batch.length;

      failedBatches += 1;

      const message =
        error.message ||
        "Kesalahan Cloudinary tidak diketahui.";

      errors.push({
        batch:
          index + 1,

        public_ids:
          batch,

        message,
      });

      console.error(
        `Cloudinary batch ${
          index + 1
        }/${batches.length} gagal:`,
        message
      );
    }

    /*
     * Jeda kecil antarbatches agar koneksi
     * tidak dihantam terus-menerus.
     */
    if (
      index <
      batches.length - 1
    ) {
      await new Promise(
        (resolve) => {
          setTimeout(
            resolve,
            250
          );
        }
      );
    }
  }

  return {
    success:
      failedCount === 0,

    total_requested:
      normalizedPublicIds.length,

    synced_count:
      syncedCount,

    failed_count:
      failedCount,

    successful_batches:
      successfulBatches,

    failed_batches:
      failedBatches,

    errors,
  };
}

/*
|--------------------------------------------------------------------------
| Proses koreksi satu label
|--------------------------------------------------------------------------
*/

async function processLabelUpdate(
  publicIdValue,
  labelValue
) {
  const publicId =
    normalizePublicId(
      publicIdValue
    );

  const label =
    normalizeLabel(
      labelValue
    );

  if (!publicId) {
    const error = new Error(
      "public_id gambar wajib diisi."
    );

    error.status = 400;
    throw error;
  }

  if (!label) {
    const error = new Error(
      "Label hanya boleh medis atau non_medis."
    );

    error.status = 400;
    throw error;
  }

  /*
   * Simpan lokal lebih dahulu.
   *
   * uploads.json menjadi sumber utama
   * untuk tampilan dashboard dan galeri.
   */
  const updatedUpload =
    updateUploadLabel(
      publicId,
      label
    );

  if (!updatedUpload) {
    const error = new Error(
      "Data gambar tidak ditemukan di uploads.json."
    );

    error.status = 404;
    throw error;
  }

  /*
   * Sinkronisasi Cloudinary dilakukan setelah
   * penyimpanan lokal berhasil.
   */
  const cloudinaryResult =
    await synchronizeLabelsToCloudinary(
      [publicId],
      label
    );

  console.log(
    "Label berhasil diperbarui:",
    {
      public_id:
        publicId,

      label,

      label_updated_at:
        updatedUpload.label_updated_at,

      cloudinary_synced:
        cloudinaryResult.success,
    }
  );

  return {
    updatedUpload,
    cloudinaryResult,
  };
}

/*
|--------------------------------------------------------------------------
| Proses koreksi label bulk
|--------------------------------------------------------------------------
*/

async function processBulkLabelUpdate(
  publicIdsValue,
  labelValue
) {
  const publicIds =
    normalizePublicIds(
      publicIdsValue
    );

  const label =
    normalizeLabel(
      labelValue
    );

  if (
    publicIds.length === 0
  ) {
    const error = new Error(
      "Tidak ada gambar yang dipilih."
    );

    error.status = 400;
    throw error;
  }

  if (
    publicIds.length >
    MAX_BULK_ITEMS
  ) {
    const error = new Error(
      `Maksimal ${MAX_BULK_ITEMS} gambar dalam satu proses bulk.`
    );

    error.status = 400;
    throw error;
  }

  if (!label) {
    const error = new Error(
      "Label hanya boleh medis atau non_medis."
    );

    error.status = 400;
    throw error;
  }

  /*
   * Simpan seluruh perubahan lokal
   * hanya dengan satu kali penulisan file.
   */
  const localResult =
    updateMultipleUploadLabels(
      publicIds,
      label
    );

  if (
    localResult.updatedCount === 0 &&
    localResult.updatedUploads.length === 0
  ) {
    const error = new Error(
      "Tidak ada data gambar yang ditemukan untuk diperbarui."
    );

    error.status = 404;
    throw error;
  }

  /*
   * Gunakan public_id yang benar-benar ditemukan
   * di uploads.json.
   */
  const matchedPublicIds =
    localResult.updatedUploads.map(
      (item) => item.public_id
    );

  /*
   * Sinkronisasi metadata Cloudinary
   * dilakukan per batch.
   */
  const cloudinaryResult =
    await synchronizeLabelsToCloudinary(
      matchedPublicIds,
      label
    );

  console.log(
    "Bulk update label selesai:",
    {
      requested:
        publicIds.length,

      updated:
        localResult.updatedCount,

      missing:
        localResult
          .missingPublicIds
          ?.length || 0,

      label,

      cloudinary_synced:
        cloudinaryResult
          .synced_count,

      cloudinary_failed:
        cloudinaryResult
          .failed_count,
    }
  );

  return {
    localResult,
    cloudinaryResult,
    label,
  };
}

/*
|--------------------------------------------------------------------------
| JSON API satu label
|--------------------------------------------------------------------------
|
| POST /api/update-label
|
| Body:
|
| {
|   "public_id": "folder/nama_gambar",
|   "label": "non_medis"
| }
|
*/

router.post(
  "/update-label",
  async (req, res) => {
    try {
      console.log(
        "POST /api/update-label",
        req.body
      );

      const result =
        await processLabelUpdate(
          req.body?.public_id,
          req.body?.label
        );

      const cloudinarySynced =
        result
          .cloudinaryResult
          .success;

      return res
        .status(200)
        .json({
          success: true,

          message:
            cloudinarySynced
              ? "Label berhasil disimpan ke data lokal dan Cloudinary."
              : "Label berhasil disimpan ke data lokal, tetapi sinkronisasi Cloudinary belum berhasil.",

          cloudinary_synced:
            cloudinarySynced,

          cloudinary:
            result
              .cloudinaryResult,

          data: {
            public_id:
              result
                .updatedUpload
                .public_id,

            label:
              result
                .updatedUpload
                .label,

            label_updated_at:
              result
                .updatedUpload
                .label_updated_at,
          },
        });
    } catch (error) {
      console.error(
        "Gagal memperbarui label:",
        error
      );

      return res
        .status(
          error.status || 500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Label gagal diperbarui.",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Form HTML satu label
|--------------------------------------------------------------------------
|
| POST /api/update-label-form
|
*/

router.post(
  "/update-label-form",
  async (req, res) => {
    try {
      console.log(
        "POST /api/update-label-form",
        req.body
      );

      const result =
        await processLabelUpdate(
          req.body?.public_id,
          req.body?.label
        );

      const message =
        result
          .cloudinaryResult
          .success
          ? "Label berhasil disimpan."
          : "Label berhasil disimpan secara lokal, tetapi Cloudinary belum tersinkronisasi.";

      return res.redirect(
        303,
        `/gallery?label_updated=${encodeURIComponent(
          message
        )}`
      );
    } catch (error) {
      console.error(
        "Gagal memperbarui label dari form:",
        error
      );

      return res.redirect(
        303,
        `/gallery?label_error=${encodeURIComponent(
          error.message ||
            "Label gagal diperbarui."
        )}`
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| JSON API bulk label
|--------------------------------------------------------------------------
|
| POST /api/update-labels-bulk
|
| Body:
|
| {
|   "public_ids": [
|     "folder/gambar_1",
|     "folder/gambar_2"
|   ],
|   "label": "non_medis"
| }
|
*/

router.post(
  "/update-labels-bulk",
  async (req, res) => {
    try {
      console.log(
        "POST /api/update-labels-bulk",
        {
          total_public_ids:
            Array.isArray(
              req.body?.public_ids
            )
              ? req.body
                  .public_ids
                  .length
              : 0,

          label:
            req.body?.label,
        }
      );

      const result =
        await processBulkLabelUpdate(
          req.body?.public_ids,
          req.body?.label
        );

      const {
        localResult,
        cloudinaryResult,
        label,
      } = result;

      let message =
        `${localResult.updatedCount} label berhasil diperbarui secara lokal.`;

      if (
        cloudinaryResult.success
      ) {
        message =
          `${localResult.updatedCount} label berhasil diperbarui dan disinkronkan ke Cloudinary.`;
      } else if (
        cloudinaryResult
          .synced_count > 0
      ) {
        message =
          `${localResult.updatedCount} label berhasil diperbarui secara lokal. ` +
          `${cloudinaryResult.synced_count} berhasil disinkronkan ke Cloudinary dan ` +
          `${cloudinaryResult.failed_count} gagal disinkronkan.`;
      }

      return res
        .status(200)
        .json({
          success: true,

          message,

          label,

          requested_count:
            localResult
              .requestedCount,

          updated_count:
            localResult
              .updatedCount,

          missing_count:
            localResult
              .missingPublicIds
              ?.length || 0,

          missing_public_ids:
            localResult
              .missingPublicIds ||
            [],

          cloudinary_synced:
            cloudinaryResult
              .success,

          cloudinary:
            cloudinaryResult,

          label_updated_at:
            localResult
              .label_updated_at ||
            null,
        });
    } catch (error) {
      console.error(
        "Bulk update label gagal:",
        error
      );

      return res
        .status(
          error.status || 500
        )
        .json({
          success: false,

          message:
            error.message ||
            "Bulk update label gagal.",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Tes route label
|--------------------------------------------------------------------------
|
| GET /api/label-status
|
*/

router.get(
  "/label-status",
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Route koreksi label aktif.",

        cloudinary_ready:
          isCloudinaryReady(),

        endpoints: {
          single_json:
            "POST /api/update-label",

          single_form:
            "POST /api/update-label-form",

          bulk_json:
            "POST /api/update-labels-bulk",
        },

        limits: {
          max_bulk_items:
            MAX_BULK_ITEMS,

          cloudinary_batch_size:
            CLOUDINARY_BATCH_SIZE,
        },
      });
  }
);

module.exports = router;
