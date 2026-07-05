const express = require("express");
const cloudinary = require("cloudinary").v2;

const {
  invalidateCloudinaryCache,
} = require(
  "../services/cloudinaryRepository"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Konfigurasi
|--------------------------------------------------------------------------
*/

const MAX_BULK_ITEMS = 100;

const CLOUDINARY_OPTIONS = {
  resource_type: "image",
  type: "upload",
};

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

  secure: true,
});

/*
|--------------------------------------------------------------------------
| Helper Error
|--------------------------------------------------------------------------
*/

function createHttpError(
  message,
  status = 400
) {
  const error =
    new Error(message);

  error.status =
    status;

  return error;
}

/*
|--------------------------------------------------------------------------
| Status Konfigurasi Cloudinary
|--------------------------------------------------------------------------
*/

function isCloudinaryReady() {
  return Boolean(
    process.env
      .CLOUDINARY_CLOUD_NAME &&
      process.env
        .CLOUDINARY_API_KEY &&
      process.env
        .CLOUDINARY_API_SECRET
  );
}

function validateCloudinaryConfiguration() {
  if (!isCloudinaryReady()) {
    throw createHttpError(
      "Konfigurasi Cloudinary belum lengkap.",
      503
    );
  }
}

/*
|--------------------------------------------------------------------------
| Normalisasi Label
|--------------------------------------------------------------------------
*/

function normalizeLabel(
  label = ""
) {
  const value =
    String(label)
      .trim()
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_"
      );

  if (
    [
      "medis",
      "non_medis",
    ].includes(value)
  ) {
    return value;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Normalisasi Public ID
|--------------------------------------------------------------------------
*/

function normalizePublicId(
  publicId = ""
) {
  return String(
    publicId
  ).trim();
}

function normalizePublicIds(
  publicIds = []
) {
  const values =
    Array.isArray(
      publicIds
    )
      ? publicIds
      : [publicIds];

  return Array.from(
    new Set(
      values
        .map(
          (publicId) =>
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
| Validasi Satu Label
|--------------------------------------------------------------------------
*/

function validateSingleInput(
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
    throw createHttpError(
      "public_id gambar wajib diisi."
    );
  }

  if (!label) {
    throw createHttpError(
      "Label hanya boleh medis atau non_medis."
    );
  }

  return {
    publicId,
    label,
  };
}

/*
|--------------------------------------------------------------------------
| Validasi Bulk Label
|--------------------------------------------------------------------------
*/

function validateBulkInput(
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
    throw createHttpError(
      "Tidak ada gambar yang dipilih."
    );
  }

  if (
    publicIds.length >
    MAX_BULK_ITEMS
  ) {
    throw createHttpError(
      `Maksimal ${MAX_BULK_ITEMS} gambar dalam satu bulk update.`
    );
  }

  if (!label) {
    throw createHttpError(
      "Label hanya boleh medis atau non_medis."
    );
  }

  return {
    publicIds,
    label,
  };
}

/*
|--------------------------------------------------------------------------
| Wrapper Context Cloudinary
|--------------------------------------------------------------------------
*/

function addContext(
  publicIds,
  contextValue
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      cloudinary.uploader
        .add_context(
          contextValue,

          publicIds,

          CLOUDINARY_OPTIONS,

          (
            error,
            result
          ) => {
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
| Wrapper Tambah Tag
|--------------------------------------------------------------------------
*/

function addTag(
  tag,
  publicIds
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      cloudinary.uploader
        .add_tag(
          tag,

          publicIds,

          CLOUDINARY_OPTIONS,

          (
            error,
            result
          ) => {
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
| Wrapper Hapus Tag
|--------------------------------------------------------------------------
*/

function removeTag(
  tag,
  publicIds
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      cloudinary.uploader
        .remove_tag(
          tag,

          publicIds,

          CLOUDINARY_OPTIONS,

          (
            error,
            result
          ) => {
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
| Memperbarui Label Cloudinary
|--------------------------------------------------------------------------
|
| Proses:
|
| 1. Context actual_label diperbarui.
| 2. Context label diperbarui.
| 3. Waktu koreksi disimpan.
| 4. Tag label lama dihapus.
| 5. Tag label baru ditambahkan.
| 6. Cache Dashboard dan Gallery dihapus.
|
*/

async function updateCloudinaryLabels(
  publicIds,
  label
) {
  validateCloudinaryConfiguration();

  const labelUpdatedAt =
    new Date()
      .toISOString();

  const contextValue = [
    `actual_label=${label}`,
    `label=${label}`,
    `label_updated_at=${labelUpdatedAt}`,
  ].join("|");

  /*
   * Mendukung tag lama dan tag baru.
   */

  const oldLabelTags = [
    "medis",
    "non_medis",
    "unknown",
    "label_medis",
    "label_non_medis",
    "label_unknown",
  ];

  const newLabelTags = [
    "dataset",
    "dataset_limbah",
    label,
    `label_${label}`,
  ];

  try {
    /*
     * Perbarui contextual metadata.
     */

    await addContext(
      publicIds,
      contextValue
    );

    /*
     * Hapus seluruh kemungkinan
     * tag label sebelumnya.
     */

    await Promise.all(
      oldLabelTags.map(
        (tag) =>
          removeTag(
            tag,
            publicIds
          )
      )
    );

    /*
     * Tambahkan tag label baru.
     */

    await Promise.all(
      newLabelTags.map(
        (tag) =>
          addTag(
            tag,
            publicIds
          )
      )
    );

    /*
     * Data cache lama tidak boleh
     * ditampilkan setelah koreksi.
     */

    invalidateCloudinaryCache();

    return {
      success: true,

      requested_count:
        publicIds.length,

      updated_count:
        publicIds.length,

      label,

      label_updated_at:
        labelUpdatedAt,

      public_ids:
        publicIds,
    };
  } catch (error) {
    /*
     * Context mungkin sudah berubah sebelum
     * salah satu proses tag gagal. Cache tetap
     * dibuang agar pembacaan berikutnya mengambil
     * kondisi terbaru dari Cloudinary.
     */

    invalidateCloudinaryCache();

    const cloudinaryError =
      createHttpError(
        error.message ||
          "Label gagal diperbarui di Cloudinary.",

        502
      );

    cloudinaryError.cause =
      error;

    throw cloudinaryError;
  }
}

/*
|--------------------------------------------------------------------------
| JSON API Satu Label
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

  async (
    req,
    res
  ) => {
    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    try {
      const {
        publicId,
        label,
      } =
        validateSingleInput(
          req.body
            ?.public_id,

          req.body
            ?.label
        );

      const result =
        await updateCloudinaryLabels(
          [publicId],
          label
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Label berhasil diperbarui di Cloudinary.",

          data: {
            public_id:
              publicId,

            label:
              result.label,

            label_updated_at:
              result
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
          error.status ||
          500
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
| Form HTML Satu Label
|--------------------------------------------------------------------------
|
| POST /api/update-label-form
|
*/

router.post(
  "/update-label-form",

  async (
    req,
    res
  ) => {
    try {
      const {
        publicId,
        label,
      } =
        validateSingleInput(
          req.body
            ?.public_id,

          req.body
            ?.label
        );

      await updateCloudinaryLabels(
        [publicId],
        label
      );

      return res.redirect(
        303,

        `/gallery?label_updated=${encodeURIComponent(
          "Label berhasil diperbarui di Cloudinary."
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
| JSON API Bulk Label
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

  async (
    req,
    res
  ) => {
    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    try {
      const {
        publicIds,
        label,
      } =
        validateBulkInput(
          req.body
            ?.public_ids,

          req.body
            ?.label
        );

      const result =
        await updateCloudinaryLabels(
          publicIds,
          label
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            `${result.updated_count} label berhasil diperbarui di Cloudinary.`,

          label:
            result.label,

          requested_count:
            result
              .requested_count,

          updated_count:
            result
              .updated_count,

          failed_count:
            0,

          label_updated_at:
            result
              .label_updated_at,
        });
    } catch (error) {
      console.error(
        "Bulk update label gagal:",
        error
      );

      return res
        .status(
          error.status ||
          500
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

module.exports = router;