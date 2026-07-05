
const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;

const UPLOADS_FILE = path.join(
  DATA_DIR,
  "uploads.json"
);

/*
|--------------------------------------------------------------------------
| Konfigurasi
|--------------------------------------------------------------------------
|
| Target dataset:
| - 1.500 medis
| - 1.500 non-medis
| - Total 3.000 gambar
|
*/

const MAX_RECENT_UPLOADS = 3000;

/*
|--------------------------------------------------------------------------
| Helper
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

  return "unknown";
}

function normalizePublicId(publicId = "") {
  return String(publicId).trim();
}

/*
|--------------------------------------------------------------------------
| Memastikan uploads.json tersedia
|--------------------------------------------------------------------------
*/

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true,
    });
  }

  if (!fs.existsSync(UPLOADS_FILE)) {
    fs.writeFileSync(
      UPLOADS_FILE,
      JSON.stringify([], null, 2),
      "utf-8"
    );
  }
}

/*
|--------------------------------------------------------------------------
| Normalisasi metadata
|--------------------------------------------------------------------------
*/

function normalizeUploadData(
  uploadData = {}
) {
  return {
    id:
      uploadData.id ||
      uploadData.asset_id ||
      `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`,

    label: normalizeLabel(
      uploadData.label
    ),

    source:
      uploadData.source ||
      "esp32cam",

    public_id:
      normalizePublicId(
        uploadData.public_id
      ) || "-",

    secure_url:
      uploadData.secure_url ||
      uploadData.image_url ||
      "",

    width:
      Number(uploadData.width) > 0
        ? Number(uploadData.width)
        : null,

    height:
      Number(uploadData.height) > 0
        ? Number(uploadData.height)
        : null,

    format:
      String(
        uploadData.format || "jpg"
      ).toLowerCase(),

    bytes:
      Number(uploadData.bytes) || 0,

    created_at:
      uploadData.created_at ||
      uploadData.createdAt ||
      new Date().toISOString(),

    /*
     * Nilai ini menandakan bahwa label
     * pernah dikoreksi secara manual.
     */
    label_updated_at:
      uploadData.label_updated_at ||
      uploadData.labelUpdatedAt ||
      null,
  };
}

/*
|--------------------------------------------------------------------------
| Membaca uploads.json
|--------------------------------------------------------------------------
*/

function loadUploadsFromFile() {
  try {
    ensureDataFile();

    const fileContent =
      fs.readFileSync(
        UPLOADS_FILE,
        "utf-8"
      );

    if (!fileContent.trim()) {
      return [];
    }

    const parsedData =
      JSON.parse(fileContent);

    if (!Array.isArray(parsedData)) {
      console.warn(
        "Isi uploads.json bukan array. Data dikembalikan menjadi kosong."
      );

      return [];
    }

    const uniqueUploads =
      new Map();

    parsedData.forEach(
      (uploadData) => {
        const normalizedData =
          normalizeUploadData(
            uploadData
          );

        if (
          !normalizedData.public_id ||
          normalizedData.public_id === "-" ||
          !normalizedData.secure_url
        ) {
          return;
        }

        /*
         * Mencegah public_id ganda.
         */
        if (
          !uniqueUploads.has(
            normalizedData.public_id
          )
        ) {
          uniqueUploads.set(
            normalizedData.public_id,
            normalizedData
          );
        }
      }
    );

    return Array.from(
      uniqueUploads.values()
    )
      .sort(
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
      )
      .slice(
        0,
        MAX_RECENT_UPLOADS
      );
  } catch (error) {
    console.error(
      "Gagal membaca uploads.json:",
      error.message
    );

    return [];
  }
}

/*
|--------------------------------------------------------------------------
| Data dalam memori
|--------------------------------------------------------------------------
*/

let recentUploads =
  loadUploadsFromFile();

/*
|--------------------------------------------------------------------------
| Menyimpan uploads.json
|--------------------------------------------------------------------------
*/

function saveUploadsToFile() {
  try {
    ensureDataFile();

    fs.writeFileSync(
      UPLOADS_FILE,
      JSON.stringify(
        recentUploads,
        null,
        2
      ),
      "utf-8"
    );

    return true;
  } catch (error) {
    console.error(
      "Gagal menyimpan uploads.json:",
      error.message
    );

    return false;
  }
}

/*
|--------------------------------------------------------------------------
| Menambahkan upload baru
|--------------------------------------------------------------------------
*/

function addRecentUpload(
  uploadData
) {
  const normalizedData =
    normalizeUploadData(
      uploadData
    );

  if (
    !normalizedData.public_id ||
    normalizedData.public_id === "-"
  ) {
    throw new Error(
      "public_id upload tidak valid."
    );
  }

  const previousUploads =
    recentUploads.map(
      (item) => ({
        ...item,
      })
    );

  /*
   * Hapus data lama dengan public_id sama.
   */
  recentUploads =
    recentUploads.filter(
      (item) =>
        item.public_id !==
        normalizedData.public_id
    );

  recentUploads.unshift(
    normalizedData
  );

  recentUploads =
    recentUploads.slice(
      0,
      MAX_RECENT_UPLOADS
    );

  if (!saveUploadsToFile()) {
    recentUploads =
      previousUploads;

    throw new Error(
      "Metadata upload gagal disimpan ke uploads.json."
    );
  }

  return {
    ...normalizedData,
  };
}

/*
|--------------------------------------------------------------------------
| Mengambil semua metadata
|--------------------------------------------------------------------------
*/

function getRecentUploads() {
  return recentUploads.map(
    (item) => ({
      ...item,
    })
  );
}

/*
|--------------------------------------------------------------------------
| Mengganti semua metadata hasil sinkronisasi
|--------------------------------------------------------------------------
|
| Label manual lokal dipertahankan apabila
| label_updated_at sudah tersedia.
|
*/

function replaceRecentUploads(
  newUploads = []
) {
  if (!Array.isArray(newUploads)) {
    throw new TypeError(
      "Data pengganti upload harus berupa array."
    );
  }

  const previousUploads =
    recentUploads.map(
      (item) => ({
        ...item,
      })
    );

  const previousUploadMap =
    new Map(
      previousUploads.map(
        (item) => [
          item.public_id,
          item,
        ]
      )
    );

  const uniqueUploads =
    new Map();

  newUploads.forEach(
    (uploadData) => {
      const publicId =
        normalizePublicId(
          uploadData.public_id
        );

      const previousData =
        previousUploadMap.get(
          publicId
        );

      /*
       * Jika sebelumnya sudah dikoreksi manual,
       * label lokal harus dipertahankan.
       */
      const hasManualLabel =
        Boolean(
          previousData
            ?.label_updated_at
        ) &&
        [
          "medis",
          "non_medis",
        ].includes(
          normalizeLabel(
            previousData.label
          )
        );

      const normalizedData =
        normalizeUploadData({
          ...uploadData,

          public_id:
            publicId,

          label:
            hasManualLabel
              ? previousData.label
              : uploadData.label,

          label_updated_at:
            previousData
              ?.label_updated_at ||
            uploadData
              .label_updated_at ||
            null,
        });

      if (
        !normalizedData.public_id ||
        normalizedData.public_id === "-"
      ) {
        return;
      }

      uniqueUploads.set(
        normalizedData.public_id,
        normalizedData
      );
    }
  );

  recentUploads =
    Array.from(
      uniqueUploads.values()
    )
      .sort(
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
      )
      .slice(
        0,
        MAX_RECENT_UPLOADS
      );

  if (!saveUploadsToFile()) {
    recentUploads =
      previousUploads;

    throw new Error(
      "Hasil sinkronisasi gagal disimpan ke uploads.json."
    );
  }

  return getRecentUploads();
}

/*
|--------------------------------------------------------------------------
| Memperbarui satu label
|--------------------------------------------------------------------------
*/

function updateUploadLabel(
  publicId,
  newLabel
) {
  const normalizedPublicId =
    normalizePublicId(
      publicId
    );

  const normalizedNewLabel =
    normalizeLabel(
      newLabel
    );

  if (!normalizedPublicId) {
    throw new Error(
      "public_id gambar wajib diisi."
    );
  }

  if (
    ![
      "medis",
      "non_medis",
    ].includes(
      normalizedNewLabel
    )
  ) {
    throw new Error(
      "Label hanya boleh medis atau non_medis."
    );
  }

  const uploadIndex =
    recentUploads.findIndex(
      (item) =>
        item.public_id ===
        normalizedPublicId
    );

  if (uploadIndex === -1) {
    return null;
  }

  const previousUpload = {
    ...recentUploads[
      uploadIndex
    ],
  };

  const updatedUpload = {
    ...previousUpload,

    label:
      normalizedNewLabel,

    label_updated_at:
      new Date().toISOString(),
  };

  recentUploads[
    uploadIndex
  ] = updatedUpload;

  if (!saveUploadsToFile()) {
    recentUploads[
      uploadIndex
    ] = previousUpload;

    throw new Error(
      "Label gagal disimpan ke uploads.json."
    );
  }

  return {
    ...updatedUpload,
  };
}

/*
|--------------------------------------------------------------------------
| Memperbarui banyak label sekaligus
|--------------------------------------------------------------------------
|
| Contoh:
|
| updateMultipleUploadLabels(
|   [
|     "folder/gambar_1",
|     "folder/gambar_2"
|   ],
|   "non_medis"
| );
|
*/

function updateMultipleUploadLabels(
  publicIds = [],
  newLabel
) {
  if (!Array.isArray(publicIds)) {
    throw new TypeError(
      "publicIds harus berupa array."
    );
  }

  const normalizedNewLabel =
    normalizeLabel(
      newLabel
    );

  if (
    ![
      "medis",
      "non_medis",
    ].includes(
      normalizedNewLabel
    )
  ) {
    throw new Error(
      "Label hanya boleh medis atau non_medis."
    );
  }

  /*
   * Bersihkan public_id kosong
   * dan hapus data ganda.
   */
  const uniquePublicIds =
    Array.from(
      new Set(
        publicIds
          .map(
            (publicId) =>
              normalizePublicId(
                publicId
              )
          )
          .filter(Boolean)
      )
    );

  if (
    uniquePublicIds.length === 0
  ) {
    throw new Error(
      "Tidak ada gambar yang dipilih."
    );
  }

  const selectedPublicIds =
    new Set(
      uniquePublicIds
    );

  const previousUploads =
    recentUploads.map(
      (item) => ({
        ...item,
      })
    );

  /*
   * Semua data dalam satu bulk update
   * mendapat waktu koreksi yang sama.
   */
  const updatedAt =
    new Date().toISOString();

  const foundPublicIds =
    new Set();

  let updatedCount = 0;

  recentUploads =
    recentUploads.map(
      (item) => {
        if (
          !selectedPublicIds.has(
            item.public_id
          )
        ) {
          return item;
        }

        foundPublicIds.add(
          item.public_id
        );

        updatedCount += 1;

        return {
          ...item,

          label:
            normalizedNewLabel,

          label_updated_at:
            updatedAt,
        };
      }
    );

  /*
   * Tidak ada public_id yang cocok.
   */
  if (updatedCount === 0) {
    return {
      requestedCount:
        uniquePublicIds.length,

      updatedCount: 0,

      missingPublicIds:
        uniquePublicIds,

      updatedUploads: [],
    };
  }

  /*
   * Hanya menulis uploads.json satu kali,
   * meskipun yang diubah ratusan gambar.
   */
  if (!saveUploadsToFile()) {
    recentUploads =
      previousUploads;

    throw new Error(
      "Perubahan label bulk gagal disimpan ke uploads.json."
    );
  }

  const missingPublicIds =
    uniquePublicIds.filter(
      (publicId) =>
        !foundPublicIds.has(
          publicId
        )
    );

  const updatedUploads =
    recentUploads
      .filter(
        (item) =>
          foundPublicIds.has(
            item.public_id
          )
      )
      .map(
        (item) => ({
          ...item,
        })
      );

  return {
    requestedCount:
      uniquePublicIds.length,

    updatedCount,

    missingPublicIds,

    updatedUploads,

    label:
      normalizedNewLabel,

    label_updated_at:
      updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| Ringkasan dataset
|--------------------------------------------------------------------------
*/

function getUploadSummary() {
  const total =
    recentUploads.length;

  const medis =
    recentUploads.filter(
      (item) =>
        normalizeLabel(
          item.label
        ) === "medis"
    ).length;

  const nonMedis =
    recentUploads.filter(
      (item) =>
        normalizeLabel(
          item.label
        ) === "non_medis"
    ).length;

  const unknown =
    recentUploads.filter(
      (item) =>
        normalizeLabel(
          item.label
        ) === "unknown"
    ).length;

  const totalBytes =
    recentUploads.reduce(
      (sum, item) => {
        return (
          sum +
          (
            Number(
              item.bytes
            ) || 0
          )
        );
      },
      0
    );

  return {
    total,

    medis,

    non_medis:
      nonMedis,

    unknown,

    total_bytes:
      totalBytes,

    latest_upload:
      recentUploads[0]
        ? {
            ...recentUploads[0],
          }
        : null,
  };
}

/*
|--------------------------------------------------------------------------
| Menghapus satu metadata
|--------------------------------------------------------------------------
*/

function removeRecentUploadByPublicId(
  publicId
) {
  const normalizedPublicId =
    normalizePublicId(
      publicId
    );

  if (!normalizedPublicId) {
    return false;
  }

  const previousUploads =
    recentUploads.map(
      (item) => ({
        ...item,
      })
    );

  const previousLength =
    recentUploads.length;

  recentUploads =
    recentUploads.filter(
      (item) =>
        item.public_id !==
        normalizedPublicId
    );

  if (
    recentUploads.length ===
    previousLength
  ) {
    return false;
  }

  if (!saveUploadsToFile()) {
    recentUploads =
      previousUploads;

    throw new Error(
      "Metadata gambar gagal dihapus dari uploads.json."
    );
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| Menghapus semua metadata lokal
|--------------------------------------------------------------------------
*/

function clearRecentUploads() {
  const previousUploads =
    recentUploads.map(
      (item) => ({
        ...item,
      })
    );

  recentUploads = [];

  if (!saveUploadsToFile()) {
    recentUploads =
      previousUploads;

    throw new Error(
      "Metadata lokal gagal dikosongkan."
    );
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  addRecentUpload,
  getRecentUploads,
  getUploadSummary,
  replaceRecentUploads,
  removeRecentUploadByPublicId,
  updateUploadLabel,
  updateMultipleUploadLabels,
  clearRecentUploads,
};

