const cloudinary = require("cloudinary").v2;

/*
|--------------------------------------------------------------------------
| Konfigurasi Dasar
|--------------------------------------------------------------------------
*/

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER ||
  "skripsi_dataset_medis";

const CLOUDINARY_DATASET_TAG =
  process.env.CLOUDINARY_DATASET_TAG ||
  "dataset_limbah";

const DEFAULT_RECENT_LIMIT = 20;
const DEFAULT_GALLERY_LIMIT = 100;

const ALLOWED_GALLERY_LIMITS = [
  20,
  50,
  100,
];

const CLOUDINARY_PAGE_SIZE = 500;
const CLOUDINARY_BATCH_SIZE = 100;
const CLOUDINARY_TIMEOUT_MS = 20000;
const CACHE_TTL_MS = 60 * 1000;

/*
|--------------------------------------------------------------------------
| Cache Data Cloudinary
|--------------------------------------------------------------------------
|
| Cache digunakan untuk Dashboard dan Summary.
|
| Cache bukan penyimpanan permanen. Pada Vercel,
| cache dapat hilang ketika instance Function berhenti.
|
*/

let uploadsCache = {
  data: null,
  expiresAt: 0,
  pending: null,
};

/*
|--------------------------------------------------------------------------
| Konfigurasi Cloudinary
|--------------------------------------------------------------------------
*/

function configureCloudinary() {
  const requiredVariables = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingVariables =
    requiredVariables.filter((name) => {
      return !String(
        process.env[name] || ""
      ).trim();
    });

  if (missingVariables.length > 0) {
    throw new Error(
      `Konfigurasi Cloudinary belum lengkap: ${missingVariables.join(
        ", "
      )}`
    );
  }

  cloudinary.config({
    cloud_name:
      process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
      process.env.CLOUDINARY_API_KEY,

    api_secret:
      process.env.CLOUDINARY_API_SECRET,

    secure: true,
  });
}

/*
|--------------------------------------------------------------------------
| Status Kesiapan Cloudinary
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
| Normalisasi Label
|--------------------------------------------------------------------------
*/

function normalizeLabel(
  label = ""
) {
  const value = String(label)
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
      "unknown",
    ].includes(value)
  ) {
    return value;
  }

  return "unknown";
}

/*
|--------------------------------------------------------------------------
| Normalisasi Label Koreksi
|--------------------------------------------------------------------------
*/

function normalizeCorrectionLabel(
  label = ""
) {
  const value =
    normalizeLabel(label);

  if (
    ![
      "medis",
      "non_medis",
    ].includes(value)
  ) {
    throw new Error(
      "Label hanya boleh medis atau non_medis."
    );
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| Normalisasi Filter Gallery
|--------------------------------------------------------------------------
*/

function normalizeGalleryFilter(
  label = "all"
) {
  const value = String(label)
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
      "unknown",
    ].includes(value)
  ) {
    return value;
  }

  return "all";
}

/*
|--------------------------------------------------------------------------
| Parsing Bilangan Positif
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

/*
|--------------------------------------------------------------------------
| Parsing Limit Gallery
|--------------------------------------------------------------------------
*/

function parseGalleryLimit(
  value
) {
  const requestedLimit =
    parsePositiveInteger(
      value,
      DEFAULT_GALLERY_LIMIT
    );

  return ALLOWED_GALLERY_LIMITS.includes(
    requestedLimit
  )
    ? requestedLimit
    : DEFAULT_GALLERY_LIMIT;
}

/*
|--------------------------------------------------------------------------
| Normalisasi Cursor
|--------------------------------------------------------------------------
*/

function normalizeCursor(
  cursor = ""
) {
  return String(
    cursor || ""
  ).trim();
}

/*
|--------------------------------------------------------------------------
| Membaca Context Cloudinary
|--------------------------------------------------------------------------
*/

function getContextValue(
  resource = {},
  key
) {
  const context =
    resource.context;

  if (
    !context ||
    typeof context !== "object"
  ) {
    return "";
  }

  /*
   * Cloudinary dapat mengembalikan:
   *
   * context.custom.label
   *
   * atau:
   *
   * context.label
   */

  const values =
    context.custom &&
    typeof context.custom ===
      "object"
      ? context.custom
      : context;

  const value =
    values[key];

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

/*
|--------------------------------------------------------------------------
| Mengambil Nama File
|--------------------------------------------------------------------------
*/

function getFileName(
  publicId = ""
) {
  return (
    String(publicId)
      .split("/")
      .pop() || ""
  );
}

/*
|--------------------------------------------------------------------------
| Membaca Label dari Tags
|--------------------------------------------------------------------------
*/

function getLabelFromTags(
  tags = []
) {
  if (!Array.isArray(tags)) {
    return "";
  }

  if (
    tags.includes(
      "non_medis"
    ) ||
    tags.includes(
      "label_non_medis"
    )
  ) {
    return "non_medis";
  }

  if (
    tags.includes(
      "medis"
    ) ||
    tags.includes(
      "label_medis"
    )
  ) {
    return "medis";
  }

  if (
    tags.includes(
      "unknown"
    ) ||
    tags.includes(
      "label_unknown"
    )
  ) {
    return "unknown";
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| Membaca Label dari Public ID
|--------------------------------------------------------------------------
*/

function getLabelFromPublicId(
  publicId = ""
) {
  const fileName =
    getFileName(
      publicId
    ).toLowerCase();

  /*
   * Periksa non_medis lebih dahulu karena
   * teks non_medis juga mengandung kata medis.
   */

  if (
    /^non[_-]?medis_/.test(
      fileName
    )
  ) {
    return "non_medis";
  }

  if (
    /^medis_/.test(
      fileName
    )
  ) {
    return "medis";
  }

  return "unknown";
}

/*
|--------------------------------------------------------------------------
| Membaca Source dari Tags
|--------------------------------------------------------------------------
*/

function getSourceFromTags(
  tags = []
) {
  if (!Array.isArray(tags)) {
    return "";
  }

  const sourceTag =
    tags.find((tag) => {
      return String(tag)
        .startsWith(
          "source_"
        );
    });

  return sourceTag
    ? String(sourceTag).slice(
        "source_".length
      )
    : "";
}

/*
|--------------------------------------------------------------------------
| Membaca Source dari Public ID
|--------------------------------------------------------------------------
*/

function getSourceFromPublicId(
  publicId = ""
) {
  const fileName =
    getFileName(
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
| Mapping Resource Cloudinary
|--------------------------------------------------------------------------
*/

function mapCloudinaryResource(
  resource = {}
) {
  const tags =
    Array.isArray(
      resource.tags
    )
      ? resource.tags
      : [];

  /*
   * Prioritas label:
   *
   * 1. actual_label hasil koreksi.
   * 2. label pada context.
   * 3. label pada tags.
   * 4. label pada public_id.
   */

  const label =
    normalizeLabel(
      getContextValue(
        resource,
        "actual_label"
      ) ||
        getContextValue(
          resource,
          "label"
        ) ||
        getLabelFromTags(
          tags
        ) ||
        getLabelFromPublicId(
          resource.public_id
        )
    );

  const source =
    getContextValue(
      resource,
      "source"
    ) ||
    getSourceFromTags(
      tags
    ) ||
    getSourceFromPublicId(
      resource.public_id
    );

  return {
    id:
      resource.asset_id ||
      resource.public_id ||
      null,

    asset_id:
      resource.asset_id ||
      null,

    label,

    source,

    public_id:
      resource.public_id ||
      "",

    secure_url:
      resource.secure_url ||
      "",

    image_url:
      resource.secure_url ||
      "",

    width:
      Number(
        resource.width
      ) ||
      null,

    height:
      Number(
        resource.height
      ) ||
      null,

    format:
      String(
        resource.format ||
          "jpg"
      ).toLowerCase(),

    bytes:
      Number(
        resource.bytes
      ) ||
      0,

    created_at:
      getContextValue(
        resource,
        "captured_at"
      ) ||
      resource.created_at ||
      null,

    cloudinary_created_at:
      resource.created_at ||
      null,

    label_updated_at:
      getContextValue(
        resource,
        "label_updated_at"
      ) ||
      null,

    tags: [
      ...tags,
    ],
  };
}

/*
|--------------------------------------------------------------------------
| Clone Data Upload
|--------------------------------------------------------------------------
*/

function cloneUploads(
  uploads = []
) {
  return uploads.map((item) => {
    return {
      ...item,

      tags:
        Array.isArray(
          item.tags
        )
          ? [
              ...item.tags,
            ]
          : [],
    };
  });
}

/*
|--------------------------------------------------------------------------
| Timeout Cloudinary
|--------------------------------------------------------------------------
*/

function withTimeout(
  promise,
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

            CLOUDINARY_TIMEOUT_MS
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
| Mengambil Seluruh Data Cloudinary
|--------------------------------------------------------------------------
|
| Digunakan oleh Dashboard dan Summary.
|
| Gallery tidak menggunakan fungsi ini untuk pagination.
| Gallery menggunakan Cloudinary Search dan next_cursor.
|
*/

async function fetchAllCloudinaryUploads() {
  configureCloudinary();

  const resources = [];

  let nextCursor =
    null;

  do {
    const options = {
      resource_type:
        "image",

      type:
        "upload",

      prefix:
        `${CLOUDINARY_FOLDER}/`,

      context:
        true,

      tags:
        true,

      max_results:
        CLOUDINARY_PAGE_SIZE,
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

        "Permintaan data Cloudinary melebihi batas waktu."
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
      null;
  } while (nextCursor);

  return resources
    .map(
      mapCloudinaryResource
    )
    .filter((item) => {
      return (
        item.public_id &&
        item.secure_url
      );
    })
    .sort(
      (
        firstItem,
        secondItem
      ) => {
        return (
          new Date(
            secondItem.created_at ||
              0
          ).getTime() -
          new Date(
            firstItem.created_at ||
              0
          ).getTime()
        );
      }
    );
}

/*
|--------------------------------------------------------------------------
| Mendapatkan Data dengan Cache
|--------------------------------------------------------------------------
*/

async function getAllCloudinaryUploads({
  forceRefresh = false,
} = {}) {
  const now =
    Date.now();

  if (
    !forceRefresh &&
    Array.isArray(
      uploadsCache.data
    ) &&
    uploadsCache.expiresAt >
      now
  ) {
    return cloneUploads(
      uploadsCache.data
    );
  }

  if (
    !forceRefresh &&
    uploadsCache.pending
  ) {
    const pendingData =
      await uploadsCache.pending;

    return cloneUploads(
      pendingData
    );
  }

  uploadsCache.pending =
    fetchAllCloudinaryUploads()
      .then((uploads) => {
        uploadsCache = {
          data:
            uploads,

          expiresAt:
            Date.now() +
            CACHE_TTL_MS,

          pending:
            null,
        };

        return uploads;
      })
      .catch((error) => {
        uploadsCache.pending =
          null;

        throw error;
      });

  const uploads =
    await uploadsCache.pending;

  return cloneUploads(
    uploads
  );
}

/*
|--------------------------------------------------------------------------
| Menghapus Cache
|--------------------------------------------------------------------------
*/

function invalidateCloudinaryCache() {
  uploadsCache = {
    data: null,
    expiresAt: 0,
    pending: null,
  };
}

/*
|--------------------------------------------------------------------------
| Recent Capture
|--------------------------------------------------------------------------
*/

async function getRecentCloudinaryUploads(
  limit =
    DEFAULT_RECENT_LIMIT
) {
  const safeLimit =
    Math.min(
      parsePositiveInteger(
        limit,
        DEFAULT_RECENT_LIMIT
      ),

      100
    );

  const uploads =
    await getAllCloudinaryUploads();

  return uploads.slice(
    0,
    safeLimit
  );
}

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

async function getCloudinarySummary() {
  const uploads =
    await getAllCloudinaryUploads();

  return uploads.reduce(
    (
      result,
      item
    ) => {
      result.total += 1;

      result.total_bytes +=
        Number(
          item.bytes
        ) ||
        0;

      if (
        item.label ===
        "medis"
      ) {
        result.medis += 1;
      } else if (
        item.label ===
        "non_medis"
      ) {
        result.non_medis += 1;
      } else {
        result.unknown += 1;
      }

      return result;
    },

    {
      total:
        0,

      medis:
        0,

      non_medis:
        0,

      unknown:
        0,

      total_bytes:
        0,

      latest_upload:
        uploads[0] ||
        null,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Expression Folder
|--------------------------------------------------------------------------
*/

function getFolderSearchExpression() {
  const folder =
    String(
      CLOUDINARY_FOLDER ||
        ""
    ).trim();

  if (!folder) {
    throw new Error(
      "CLOUDINARY_FOLDER wajib diisi."
    );
  }

  /*
   * Pembatasan karakter digunakan agar nilai folder
   * aman dimasukkan ke expression Cloudinary Search.
   */

  if (
    !/^[A-Za-z0-9_/-]+$/.test(
      folder
    )
  ) {
    throw new Error(
      "CLOUDINARY_FOLDER hanya boleh berisi huruf, angka, underscore, tanda hubung, atau garis miring."
    );
  }

  return (
    `public_id:${folder}/*`
  );
}

/*
|--------------------------------------------------------------------------
| Membuat Expression Gallery
|--------------------------------------------------------------------------
*/

function buildGallerySearchExpression(
  label = "all"
) {
  const selectedLabel =
    normalizeGalleryFilter(
      label
    );

  const expressions = [
    "resource_type:image",
    "type:upload",
    getFolderSearchExpression(),
  ];

  /*
   * Mendukung format metadata lama dan baru:
   *
   * context.actual_label
   * context.label
   * tag medis/non_medis
   * tag label_medis/label_non_medis
   */

  if (
    selectedLabel !== "all"
  ) {
    expressions.push(
      "(" +
        `context.actual_label=${selectedLabel} OR ` +
        `context.label=${selectedLabel} OR ` +
        `tags=${selectedLabel} OR ` +
        `tags=label_${selectedLabel}` +
        ")"
    );
  }

  return expressions.join(
    " AND "
  );
}

/*
|--------------------------------------------------------------------------
| Menjalankan Cloudinary Search
|--------------------------------------------------------------------------
*/

async function executeGallerySearch({
  cursor,
  limit,
  label,
}) {
  configureCloudinary();

  let search =
    cloudinary.search
      .expression(
        buildGallerySearchExpression(
          label
        )
      )
      .sort_by(
        "created_at",
        "desc"
      )
      .with_field(
        "context"
      )
      .with_field(
        "tags"
      )
      .max_results(
        limit
      );

  if (cursor) {
    search =
      search.next_cursor(
        cursor
      );
  }

  return withTimeout(
    search.execute(),

    "Permintaan Gallery Cloudinary melebihi batas waktu."
  );
}

/*
|--------------------------------------------------------------------------
| Gallery dengan Cursor
|--------------------------------------------------------------------------
|
| URL:
|
| /gallery?limit=100&label=medis
|
| Halaman selanjutnya:
|
| /gallery?cursor=NEXT_CURSOR&limit=100&label=medis
|
*/

async function getCloudinaryGallery({
  cursor = "",
  limit =
    DEFAULT_GALLERY_LIMIT,
  label = "all",
} = {}) {
  const safeCursor =
    normalizeCursor(
      cursor
    );

  const safeLimit =
    parseGalleryLimit(
      limit
    );

  const selectedLabel =
    normalizeGalleryFilter(
      label
    );

  const result =
    await executeGallerySearch({
      cursor:
        safeCursor,

      limit:
        safeLimit,

      label:
        selectedLabel,
    });

  /*
   * Mapping tetap dijalankan agar context actual_label
   * mempunyai prioritas dibanding tag lama.
   */

  const uploads =
    (
      result.resources ||
      []
    )
      .map(
        mapCloudinaryResource
      )
      .filter((item) => {
        return (
          selectedLabel ===
            "all" ||
          item.label ===
            selectedLabel
        );
      });

  const nextCursor =
    result.next_cursor ||
    "";

  return {
    uploads,

    pagination: {
      cursor:
        safeCursor,

      nextCursor,

      hasMore:
        Boolean(
          nextCursor
        ),

      totalItems:
        Number(
          result.total_count
        ) ||
        0,

      limit:
        safeLimit,

      selectedLabel,

      allowedLimits: [
        ...ALLOWED_GALLERY_LIMITS,
      ],
    },
  };
}

/*
|--------------------------------------------------------------------------
| Normalisasi Public ID
|--------------------------------------------------------------------------
*/

function normalizePublicIds(
  publicIds = []
) {
  const values =
    Array.isArray(
      publicIds
    )
      ? publicIds
      : [
          publicIds,
        ];

  return Array.from(
    new Set(
      values
        .map((publicId) => {
          return String(
            publicId ||
              ""
          ).trim();
        })
        .filter(Boolean)
    )
  );
}

/*
|--------------------------------------------------------------------------
| Membagi Data Menjadi Batch
|--------------------------------------------------------------------------
*/

function splitIntoBatches(
  items,
  batchSize
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
        index +
          batchSize
      )
    );
  }

  return batches;
}

/*
|--------------------------------------------------------------------------
| Wrapper Cloudinary Uploader
|--------------------------------------------------------------------------
*/

function callCloudinaryUploader(
  methodName,
  firstArgument,
  publicIds
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      cloudinary.uploader[
        methodName
      ](
        firstArgument,

        publicIds,

        {
          resource_type:
            "image",

          type:
            "upload",
        },

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
| Menambahkan Context
|--------------------------------------------------------------------------
*/

function addContext(
  publicIds,
  contextValue
) {
  return callCloudinaryUploader(
    "add_context",
    contextValue,
    publicIds
  );
}

/*
|--------------------------------------------------------------------------
| Menambahkan Tag
|--------------------------------------------------------------------------
*/

function addTag(
  tag,
  publicIds
) {
  return callCloudinaryUploader(
    "add_tag",
    tag,
    publicIds
  );
}

/*
|--------------------------------------------------------------------------
| Menghapus Tag
|--------------------------------------------------------------------------
*/

function removeTag(
  tag,
  publicIds
) {
  return callCloudinaryUploader(
    "remove_tag",
    tag,
    publicIds
  );
}

/*
|--------------------------------------------------------------------------
| Update Label Satu Batch
|--------------------------------------------------------------------------
*/

async function updateLabelBatch(
  publicIds,
  label,
  labelUpdatedAt
) {
  const contextValue = [
    `actual_label=${label}`,
    `label=${label}`,
    `label_updated_at=${labelUpdatedAt}`,
  ].join("|");

  const oldLabelTags = [
    "medis",
    "non_medis",
    "unknown",
    "label_medis",
    "label_non_medis",
    "label_unknown",
  ];

  const newTags = [
    "dataset",
    CLOUDINARY_DATASET_TAG,
    label,
    `label_${label}`,
  ];

  /*
   * Perbarui contextual metadata.
   */

  await withTimeout(
    addContext(
      publicIds,
      contextValue
    ),

    "Pembaruan context Cloudinary melebihi batas waktu."
  );

  /*
   * Hapus seluruh kemungkinan tag label lama.
   */

  await Promise.all(
    oldLabelTags.map((tag) => {
      return withTimeout(
        removeTag(
          tag,
          publicIds
        ),

        `Penghapusan tag ${tag} melebihi batas waktu.`
      );
    })
  );

  /*
   * Tambahkan tag dataset dan label baru.
   */

  await Promise.all(
    newTags.map((tag) => {
      return withTimeout(
        addTag(
          tag,
          publicIds
        ),

        `Penambahan tag ${tag} melebihi batas waktu.`
      );
    })
  );
}

/*
|--------------------------------------------------------------------------
| Update Banyak Label
|--------------------------------------------------------------------------
*/

async function updateMultipleCloudinaryLabels(
  publicIds,
  label
) {
  configureCloudinary();

  const normalizedPublicIds =
    normalizePublicIds(
      publicIds
    );

  const normalizedLabel =
    normalizeCorrectionLabel(
      label
    );

  if (
    normalizedPublicIds.length ===
    0
  ) {
    throw new Error(
      "Tidak ada public_id yang dapat diperbarui."
    );
  }

  if (
    normalizedPublicIds.length >
    CLOUDINARY_BATCH_SIZE
  ) {
    throw new Error(
      `Maksimal ${CLOUDINARY_BATCH_SIZE} gambar dalam satu bulk update.`
    );
  }

  const labelUpdatedAt =
    new Date()
      .toISOString();

  const batches =
    splitIntoBatches(
      normalizedPublicIds,
      CLOUDINARY_BATCH_SIZE
    );

  let updatedCount = 0;

  const errors = [];

  for (
    let index = 0;
    index < batches.length;
    index += 1
  ) {
    const batch =
      batches[index];

    try {
      await updateLabelBatch(
        batch,
        normalizedLabel,
        labelUpdatedAt
      );

      updatedCount +=
        batch.length;
    } catch (error) {
      errors.push({
        batch:
          index + 1,

        public_ids:
          batch,

        message:
          error.message ||
          "Pembaruan label gagal.",
      });
    }
  }

  invalidateCloudinaryCache();

  return {
    success:
      errors.length ===
      0,

    requested_count:
      normalizedPublicIds.length,

    updated_count:
      updatedCount,

    failed_count:
      normalizedPublicIds.length -
      updatedCount,

    label:
      normalizedLabel,

    label_updated_at:
      labelUpdatedAt,

    public_ids:
      normalizedPublicIds,

    errors,
  };
}

/*
|--------------------------------------------------------------------------
| Update Satu Label
|--------------------------------------------------------------------------
*/

async function updateCloudinaryLabel(
  publicId,
  label
) {
  const normalizedPublicId =
    String(
      publicId ||
        ""
    ).trim();

  if (!normalizedPublicId) {
    throw new Error(
      "public_id gambar wajib diisi."
    );
  }

  const result =
    await updateMultipleCloudinaryLabels(
      [
        normalizedPublicId,
      ],

      label
    );

  if (!result.success) {
    throw new Error(
      result.errors[0]
        ?.message ||
        "Label Cloudinary gagal diperbarui."
    );
  }

  return {
    success:
      true,

    public_id:
      normalizedPublicId,

    label:
      result.label,

    label_updated_at:
      result.label_updated_at,
  };
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  getRecentCloudinaryUploads,
  getCloudinaryGallery,
  getCloudinarySummary,
  updateCloudinaryLabel,
  updateMultipleCloudinaryLabels,
  mapCloudinaryResource,
  invalidateCloudinaryCache,
  isCloudinaryReady,
};