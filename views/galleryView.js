const formatBytes = require("../utils/formatBytes");

const DATASET_TARGET = 3000;
const CLASS_TARGET = 1500;

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER ||
  "skripsi_dataset_medis";

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeLabel(label = "") {
  const value = String(label)
    .trim()
    .toLowerCase();

  if (value === "medis") {
    return "medis";
  }

  if (
    [
      "non_medis",
      "non-medis",
      "non medis",
    ].includes(value)
  ) {
    return "non_medis";
  }

  return "unknown";
}

function formatLabel(label = "") {
  const value =
    normalizeLabel(label);

  if (value === "medis") {
    return "Medis";
  }

  if (value === "non_medis") {
    return "Non-medis";
  }

  return "Unknown";
}

function safeNumber(
  value,
  fallback = 0
) {
  const parsed =
    Number(value);

  return (
    Number.isFinite(parsed) &&
    parsed >= 0
  )
    ? parsed
    : fallback;
}

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

function buildGalleryUrl({
  page = 1,
  limit = 100,
  label = "all",
} = {}) {
  const query =
    new URLSearchParams({
      page:
        String(page),

      limit:
        String(limit),

      label:
        String(label),
    });

  return (
    `/gallery?${query.toString()}`
  );
}

function buildPageNumbers(
  currentPage,
  totalPages
) {
  const pages =
    new Set([
      1,
      totalPages,
    ]);

  for (
    let page =
      currentPage - 2;

    page <=
    currentPage + 2;

    page += 1
  ) {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      pages.add(page);
    }
  }

  return Array
    .from(pages)
    .sort(
      (
        firstPage,
        secondPage
      ) =>
        firstPage -
        secondPage
    );
}

/*
|--------------------------------------------------------------------------
| Icon
|--------------------------------------------------------------------------
*/

function icon(
  name,
  className = "icon"
) {
  const paths = {
    grid: `
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
    `,

    camera: `
      <path
        d="M4 8.5C4 7.12 5.12 6 6.5 6h1.17c.53 0 1.04-.21 1.41-.59l.83-.82c.37-.38.88-.59 1.41-.59h1.36c.53 0 1.04.21 1.41.59l.83.82c.37.38.88.59 1.41.59h1.17C18.88 6 20 7.12 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
    `,

    chart: `
      <path
        d="M5 19V5M5 19h14M8.5 16v-4M12 16V8M15.5 16v-6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    `,

    upload: `
      <path
        d="M12 15V4m-4.5 4.5L12 4l4.5 4.5M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V15"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    file: `
      <path
        d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="M14 3.5V8h4.5M9 13h6M9 16h6M9 10h2"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    settings: `
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="M19.4 13.5c.08-.49.1-.99.05-1.5.05-.51.03-1.01-.05-1.5l1.55-1.2-1.9-3.3-1.85.75a7.4 7.4 0 0 0-2.6-1.5L14.35 3h-3.8l-.25 2.25a7.4 7.4 0 0 0-2.6 1.5L5.85 6l-1.9 3.3 1.55 1.2A7.8 7.8 0 0 0 5.45 12c-.05.51-.03 1.01.05 1.5l-1.55 1.2 1.9 3.3 1.85-.75a7.4 7.4 0 0 0 2.6 1.5l.25 2.25h3.8l.25-2.25a7.4 7.4 0 0 0 2.6-1.5l1.85.75 1.9-3.3-1.55-1.2Z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    `,

    refresh: `
      <path
        d="M20 7v5h-5M19 12a7 7 0 1 0-2.05 4.95"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    search: `
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="m16 16 4 4"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    `,

    check: `
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    external: `
      <path
        d="M14 5h5v5M19 5l-8 8M17 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    trash: `
      <path
        d="M4 7h16M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    chevronLeft: `
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,

    chevronRight: `
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        stroke-width="1.9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `,
  };

  return `
    <svg
      viewBox="0 0 24 24"
      class="${className}"
      fill="none"
      aria-hidden="true"
    >
      ${paths[name] || ""}
    </svg>
  `;
}

/*
|--------------------------------------------------------------------------
| Ikon khusus logo sidebar
|--------------------------------------------------------------------------
|
| Kelas khusus mencegah ikon mewarisi warna putih
| dari elemen sidebar.
|
*/

function brandCameraIcon() {
  return icon(
    "camera",
    "icon brand-camera-icon"
  );
}

/*
|--------------------------------------------------------------------------
| Ikon tema
|--------------------------------------------------------------------------
*/

function iconMoon() {
  return `
    <svg
      class="theme-icon theme-icon-dark"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 14.2A7.8 7.8 0 0 1 9.8 3 8.8 8.8 0 1 0 21 14.2Z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function iconSun() {
  return `
    <svg
      class="theme-icon theme-icon-light"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4V2.5M12 21.5V20M4 12H2.5M21.5 12H20M5.6 5.6 4.5 4.5M19.5 19.5l-1.1-1.1M18.4 5.6l1.1-1.1M4.5 19.5l1.1-1.1"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
    </svg>
  `;
}

/*
|--------------------------------------------------------------------------
| Gallery View
|--------------------------------------------------------------------------
*/

function galleryView({
  uploads = [],
  summary = {},
  pagination = {},
  notification = null,
}) {
  const pageUploads =
    Array.isArray(uploads)
      ? uploads.map(
          (item) => ({
            ...item,

            label:
              normalizeLabel(
                item.label
              ),
          })
        )
      : [];

  const total =
    safeNumber(
      summary.total,
      pageUploads.length
    );

  const medis =
    safeNumber(
      summary.medis,
      0
    );

  const nonMedis =
    safeNumber(
      summary.non_medis,
      0
    );

  const unknown =
    safeNumber(
      summary.unknown,
      0
    );

  const page =
    Math.max(
      1,

      Math.trunc(
        safeNumber(
          pagination.page,
          1
        )
      )
    );

  const requestedLimit =
    Math.trunc(
      safeNumber(
        pagination.limit,
        100
      )
    );

  const limit =
    [
      20,
      50,
      100,
    ].includes(
      requestedLimit
    )
      ? requestedLimit
      : 100;

  const totalItems =
    Math.trunc(
      safeNumber(
        pagination.totalItems,
        pageUploads.length
      )
    );

  const totalPages =
    Math.max(
      1,

      Math.trunc(
        safeNumber(
          pagination.totalPages,
          1
        )
      )
    );

  const selectedLabel =
    [
      "all",
      "medis",
      "non_medis",
      "unknown",
    ].includes(
      pagination.selectedLabel
    )
      ? pagination.selectedLabel
      : "all";

  const startItem =
    Math.trunc(
      safeNumber(
        pagination.startItem,

        pageUploads.length > 0
          ? (
              page - 1
            ) *
              limit +
            1
          : 0
      )
    );

  const endItem =
    Math.trunc(
      safeNumber(
        pagination.endItem,

        Math.min(
          page * limit,
          totalItems
        )
      )
    );

  const requestedLimits =
    Array.isArray(
      pagination.allowedLimits
    )
      ? pagination
          .allowedLimits
          .map(Number)
          .filter(
            (value) =>
              [
                20,
                50,
                100,
              ].includes(value)
          )
      : [];

  const allowedLimits =
    requestedLimits.length > 0
      ? requestedLimits
      : [
          20,
          50,
          100,
        ];

  const totalProgress =
    clamp(
      Math.round(
        (
          total /
          DATASET_TARGET
        ) *
          100
      ),
      0,
      100
    );

  const medisProgress =
    clamp(
      Math.round(
        (
          medis /
          CLASS_TARGET
        ) *
          100
      ),
      0,
      100
    );

  const nonMedisProgress =
    clamp(
      Math.round(
        (
          nonMedis /
          CLASS_TARGET
        ) *
          100
      ),
      0,
      100
    );

  const unknownProgress =
    total > 0
      ? clamp(
          Math.round(
            (
              unknown /
              total
            ) *
              100
          ),
          0,
          100
        )
      : 0;

  const filterName =
    selectedLabel === "all"
      ? "Semua data"
      : formatLabel(
          selectedLabel
        );

  /*
  |--------------------------------------------------------------------------
  | Notifikasi
  |--------------------------------------------------------------------------
  */

  const notificationHtml =
    notification?.message
      ? `
        <div
          class="page-alert ${
            notification.type ===
            "error"
              ? "page-alert-error"
              : "page-alert-success"
          }"
          role="status"
        >
          <span
            class="page-alert-icon"
          >
            ${icon(
              notification.type ===
              "error"
                ? "refresh"
                : "check"
            )}
          </span>

          <span>
            ${escapeHtml(
              notification.message
            )}
          </span>
        </div>
      `
      : "";

  /*
  |--------------------------------------------------------------------------
  | Filter
  |--------------------------------------------------------------------------
  */

  const filterLinks =
    [
      [
        "all",
        "Semua",
        total,
      ],

      [
        "medis",
        "Medis",
        medis,
      ],

      [
        "non_medis",
        "Non-medis",
        nonMedis,
      ],

      [
        "unknown",
        "Unknown",
        unknown,
      ],
    ]
      .map(
        ([
          value,
          text,
          count,
        ]) => {
          const active =
            selectedLabel ===
            value;

          return `
            <a
              class="filter-chip ${
                active
                  ? "active"
                  : ""
              }"
              href="${buildGalleryUrl({
                page: 1,
                limit,
                label: value,
              })}"
              ${
                active
                  ? 'aria-current="page"'
                  : ""
              }
            >
              <span>
                ${text}
              </span>

              <strong>
                ${count}
              </strong>
            </a>
          `;
        }
      )
      .join("");

  /*
  |--------------------------------------------------------------------------
  | Kartu gambar
  |--------------------------------------------------------------------------
  */

  const cards =
    pageUploads.length > 0
      ? pageUploads
          .map(
            (
              item,
              index
            ) => {
              const rawPublicId =
                String(
                  item.public_id ||
                  ""
                ).trim();

              const publicId =
                escapeHtml(
                  rawPublicId ||
                  "-"
                );

              const imageUrl =
                escapeHtml(
                  item.secure_url ||
                  item.image_url ||
                  ""
                );

              const sourceRaw =
                String(
                  item.source ||
                  "esp32cam"
                );

              const source =
                escapeHtml(
                  sourceRaw
                );

              const fileFormat =
                escapeHtml(
                  String(
                    item.format ||
                    "jpg"
                  ).toUpperCase()
                );

              const label =
                normalizeLabel(
                  item.label
                );

              const width =
                Number(
                  item.width
                ) > 0
                  ? Number(
                      item.width
                    )
                  : "-";

              const height =
                Number(
                  item.height
                ) > 0
                  ? Number(
                      item.height
                    )
                  : "-";

              const badgeClass =
                label ===
                "medis"
                  ? "badge-medical"
                  : label ===
                    "non_medis"
                  ? "badge-nonmedical"
                  : "badge-unknown";

              return `
                <article
                  class="dataset-card"
                  data-label="${label}"
                  data-public-id="${escapeHtml(
                    rawPublicId
                      .toLowerCase()
                  )}"
                  data-source="${escapeHtml(
                    sourceRaw
                      .toLowerCase()
                  )}"
                >
                  <div
                    class="card-selection"
                  >
                    <label
                      class="selection-control"
                    >
                      <input
                        type="checkbox"
                        class="select-image"
                        value="${escapeHtml(
                          rawPublicId
                        )}"
                        aria-label="Pilih ${publicId}"
                      />

                      <span
                        class="selection-box"
                      >
                        ${icon(
                          "check",
                          "selection-icon"
                        )}
                      </span>

                      <span>
                        Pilih
                      </span>
                    </label>

                    <span
                      class="card-number"
                    >
                      #${
                        startItem +
                        index
                      }
                    </span>
                  </div>

                  <a
                    class="image-frame"
                    href="${
                      imageUrl ||
                      "#"
                    }"
                    ${
                      imageUrl
                        ? 'target="_blank" rel="noreferrer"'
                        : 'aria-disabled="true"'
                    }
                  >
                    ${
                      imageUrl
                        ? `
                          <img
                            src="${imageUrl}"
                            alt="Citra dataset ${publicId}"
                            loading="lazy"
                            decoding="async"
                          />
                        `
                        : `
                          <div
                            class="image-placeholder"
                          >
                            ${icon(
                              "camera",
                              "placeholder-icon"
                            )}

                            <span>
                              Gambar tidak tersedia
                            </span>
                          </div>
                        `
                    }

                    <span
                      class="image-badge ${badgeClass}"
                    >
                      ${formatLabel(
                        label
                      )}
                    </span>
                  </a>

                  <div
                    class="card-body"
                  >
                    <div
                      class="card-heading"
                    >
                      <div
                        class="card-title-wrap"
                      >
                        <span
                          class="source-label"
                        >
                          ${source}
                        </span>

                        <h3
                          title="${publicId}"
                        >
                          ${publicId}
                        </h3>
                      </div>

                      ${
                        imageUrl
                          ? `
                            <a
                              class="icon-link"
                              href="${imageUrl}"
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Buka gambar"
                              title="Buka gambar"
                            >
                              ${icon(
                                "external"
                              )}
                            </a>
                          `
                          : ""
                      }
                    </div>

                    <div
                      class="metadata-row"
                    >
                      <span>
                        ${width}
                        ×
                        ${height}
                      </span>

                      <span>
                        ${formatBytes(
                          item.bytes ||
                          0
                        )}
                      </span>

                      <span>
                        ${fileFormat}
                      </span>
                    </div>

                    <form
                      class="single-label-form"
                      method="POST"
                      action="/api/update-label-form"
                    >
                      <input
                        type="hidden"
                        name="public_id"
                        value="${escapeHtml(
                          rawPublicId
                        )}"
                      />

                      <input
                        type="hidden"
                        name="page"
                        value="${page}"
                      />

                      <input
                        type="hidden"
                        name="limit"
                        value="${limit}"
                      />

                      <input
                        type="hidden"
                        name="filter_label"
                        value="${escapeHtml(
                          selectedLabel
                        )}"
                      />

                      <div
                        class="single-label-copy"
                      >
                        <label
                          for="label-${index}"
                        >
                          Koreksi label
                        </label>

                        <small>
                          Perubahan disimpan
                          sebagai label manual.
                        </small>
                      </div>

                      <div
                        class="single-label-controls"
                      >
                        <select
                          id="label-${index}"
                          name="label"
                          required
                          aria-label="Label untuk ${publicId}"
                        >
                          ${
                            label ===
                            "unknown"
                              ? `
                                <option
                                  value=""
                                  selected
                                  disabled
                                >
                                  Pilih label
                                </option>
                              `
                              : ""
                          }

                          <option
                            value="medis"
                            ${
                              label ===
                              "medis"
                                ? "selected"
                                : ""
                            }
                          >
                            Medis
                          </option>

                          <option
                            value="non_medis"
                            ${
                              label ===
                              "non_medis"
                                ? "selected"
                                : ""
                            }
                          >
                            Non-medis
                          </option>
                        </select>

                        <button
                          type="submit"
                          class="save-one-btn"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                </article>
              `;
            }
          )
          .join("")
      : `
        <div
          class="empty-state"
        >
          <div
            class="empty-icon"
          >
            ${icon("camera")}
          </div>

          <h2>
            Tidak ada gambar
            pada filter ini
          </h2>

          <p>
            Gunakan filter lain
            atau jalankan sinkronisasi
            Cloudinary secara manual.
          </p>

          <a
            class="btn btn-primary"
            href="${buildGalleryUrl({
              page: 1,
              limit,
              label: "all",
            })}"
          >
            Tampilkan semua data
          </a>
        </div>
      `;

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  let previousPageNumber =
    null;

  const numberedLinks =
    buildPageNumbers(
      page,
      totalPages
    )
      .map(
        (pageNumber) => {
          const gap =
            previousPageNumber !==
              null &&
            pageNumber -
              previousPageNumber >
              1
              ? `
                <span
                  class="page-gap"
                >
                  …
                </span>
              `
              : "";

          previousPageNumber =
            pageNumber;

          return `
            ${gap}

            <a
              class="page-number ${
                pageNumber ===
                page
                  ? "active"
                  : ""
              }"
              href="${buildGalleryUrl({
                page:
                  pageNumber,

                limit,

                label:
                  selectedLabel,
              })}"
              ${
                pageNumber ===
                page
                  ? 'aria-current="page"'
                  : ""
              }
            >
              ${pageNumber}
            </a>
          `;
        }
      )
      .join("");

  /*
  |--------------------------------------------------------------------------
  | HTML
  |--------------------------------------------------------------------------
  */

  return `
<!DOCTYPE html>
<html
  lang="id"
  data-theme="light"
>
<head>
  <meta
    charset="UTF-8"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Galeri Dataset Limbah · Capture Panel
  </title>
  <link
    rel="icon"
    type="image/svg+xml"
    href="/favicon.svg"
  />

  <script>
    (function () {
      /*
       * Gallery memiliki penyimpanan
       * tema sendiri.
       */
      const THEME_KEY =
        "capture-panel-gallery-theme";

      let savedTheme =
        null;

      try {
        savedTheme =
          localStorage.getItem(
            THEME_KEY
          );
      } catch (error) {
        savedTheme =
          null;
      }

      const prefersDark =
        typeof window.matchMedia ===
          "function" &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      const initialTheme =
        savedTheme === "dark" ||
        savedTheme === "light"
          ? savedTheme
          : prefersDark
          ? "dark"
          : "light";

      document.documentElement
        .setAttribute(
          "data-theme",
          initialTheme
        );

      document.documentElement
        .style
        .colorScheme =
        initialTheme;
    })();
  </script>

  <style>
    :root {
      --bg: #f5f7fb;

      --surface: #ffffff;
      --surface-soft: #f8fafc;
      --surface-muted: #f1f5f9;

      --text: #111827;
      --text-strong: #0f172a;

      --muted: #6b7280;
      --muted-2: #9ca3af;

      --line: #e5e7eb;
      --line-strong: #d1d5db;

      --primary: #111827;
      --primary-hover: #0f172a;
      --primary-soft: #f3f4f6;
      --primary-text: #ffffff;

      --accent: #0f766e;
      --accent-soft: #ecfdf5;

      --blue: #2563eb;
      --blue-soft: #eff6ff;

      --danger: #dc2626;
      --danger-hover: #b91c1c;
      --danger-soft: #fef2f2;

      --warning: #b45309;

      --sidebar: #0b1220;

      --sidebar-soft:
        rgba(
          255,
          255,
          255,
          0.08
        );

      --sidebar-line:
        rgba(
          255,
          255,
          255,
          0.1
        );

      --shadow-sm:
        0 8px 18px
        rgba(
          15,
          23,
          42,
          0.04
        );

      --shadow-md:
        0 16px 38px
        rgba(
          15,
          23,
          42,
          0.1
        );

      --radius-xl: 28px;
      --radius-lg: 20px;
      --radius-md: 14px;
    }

    html[data-theme="dark"] {
      --bg: #020617;

      --surface: #0f172a;
      --surface-soft: #111827;
      --surface-muted: #172033;

      --text: #e5e7eb;
      --text-strong: #f8fafc;

      --muted: #94a3b8;
      --muted-2: #64748b;

      --line:
        rgba(
          255,
          255,
          255,
          0.09
        );

      --line-strong:
        rgba(
          255,
          255,
          255,
          0.16
        );

      --primary: #2dd4bf;
      --primary-hover: #5eead4;

      --primary-soft:
        rgba(
          45,
          212,
          191,
          0.12
        );

      --primary-text: #020617;

      --accent: #2dd4bf;

      --accent-soft:
        rgba(
          45,
          212,
          191,
          0.12
        );

      --blue: #60a5fa;

      --blue-soft:
        rgba(
          96,
          165,
          250,
          0.14
        );

      --danger: #fb7185;
      --danger-hover: #f43f5e;

      --danger-soft:
        rgba(
          251,
          113,
          133,
          0.12
        );

      --warning: #fbbf24;

      --sidebar: #030712;

      --shadow-sm:
        0 8px 18px
        rgba(
          0,
          0,
          0,
          0.16
        );

      --shadow-md:
        0 16px 38px
        rgba(
          0,
          0,
          0,
          0.28
        );
    }

    * {
      box-sizing:
        border-box;
    }

    html {
      scroll-behavior:
        smooth;

      color-scheme:
        light;
    }

    html[data-theme="dark"] {
      color-scheme:
        dark;
    }

    body {
      margin:
        0;

      min-height:
        100vh;

      color:
        var(--text);

      background:
        var(--bg);

      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    button,
    input,
    select {
      font:
        inherit;
    }

    button,
    a,
    select,
    input[type="checkbox"] {
      -webkit-tap-highlight-color:
        transparent;
    }

    a {
      color:
        inherit;
    }

    .icon {
      width:
        20px;

      height:
        20px;

      display:
        block;

      flex:
        0 0 auto;
    }

    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    */

    .app {
      min-height:
        100vh;

      display:
        grid;

      grid-template-columns:
        270px
        minmax(
          0,
          1fr
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Sidebar
    |--------------------------------------------------------------------------
    */

    .sidebar {
      position:
        sticky;

      top:
        0;

      height:
        100vh;

      padding:
        22px;

      color:
        #ffffff;

      background:
        radial-gradient(
          circle at top left,
          rgba(
            20,
            184,
            166,
            0.18
          ),
          transparent 34%
        ),
        var(--sidebar);

      border-right:
        1px solid
        var(--sidebar-line);
    }

    .brand {
      display:
        flex;

      align-items:
        center;

      gap:
        12px;

      margin-bottom:
        28px;
    }

    /*
     * Warna logo dipisahkan dari
     * warna putih sidebar.
     */
    .brand-mark {
      width:
        42px;

      height:
        42px;

      display:
        grid;

      place-items:
        center;

      flex:
        0 0 auto;

      border-radius:
        14px;

      color:
        #0b1220 !important;

      background:
        #ffffff;

      border:
        1px solid
        rgba(
          255,
          255,
          255,
          0.86
        );

      box-shadow:
        0 10px 24px
        rgba(
          0,
          0,
          0,
          0.16
        );
    }

    .brand-mark
    .brand-camera-icon {
      width:
        21px;

      height:
        21px;

      color:
        #0b1220 !important;
    }

    html[data-theme="dark"]
    .brand-mark {
      color:
        #5eead4 !important;

      background:
        rgba(
          45,
          212,
          191,
          0.12
        );

      border-color:
        rgba(
          45,
          212,
          191,
          0.22
        );

      box-shadow:
        none;
    }

    html[data-theme="dark"]
    .brand-mark
    .brand-camera-icon {
      color:
        #5eead4 !important;
    }

    .brand-title {
      font-size:
        15px;

      font-weight:
        800;

      letter-spacing:
        -0.02em;
    }

    .brand-subtitle {
      margin-top:
        2px;

      color:
        rgba(
          255,
          255,
          255,
          0.55
        );

      font-size:
        12px;
    }

    .nav {
      display:
        grid;

      gap:
        6px;
    }

    .nav a {
      min-height:
        42px;

      padding:
        0 12px;

      display:
        flex;

      align-items:
        center;

      gap:
        11px;

      border-radius:
        13px;

      color:
        rgba(
          255,
          255,
          255,
          0.68
        );

      text-decoration:
        none;

      font-size:
        14px;

      font-weight:
        650;

      transition:
        color 0.18s ease,
        background 0.18s ease;
    }

    .nav a:hover,
    .nav a.active {
      color:
        #ffffff;

      background:
        var(--sidebar-soft);
    }

    .sidebar-footer {
      position:
        absolute;

      left:
        22px;

      right:
        22px;

      bottom:
        22px;

      padding:
        14px;

      border:
        1px solid
        var(--sidebar-line);

      border-radius:
        18px;

      background:
        rgba(
          255,
          255,
          255,
          0.07
        );
    }

    .sidebar-footer span,
    .sidebar-footer strong {
      display:
        block;
    }

    .sidebar-footer span {
      margin-bottom:
        6px;

      color:
        rgba(
          255,
          255,
          255,
          0.56
        );

      font-size:
        12px;
    }

    .sidebar-footer strong {
      font-size:
        13px;

      line-height:
        1.4;

      word-break:
        break-word;
    }

    /*
    |--------------------------------------------------------------------------
    | Main
    |--------------------------------------------------------------------------
    */

    .main {
      min-width:
        0;

      padding:
        26px;
    }

    .topbar {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        18px;

      margin-bottom:
        22px;
    }

    .page-title h1 {
      margin:
        0;

      color:
        var(--text-strong);

      font-size:
        28px;

      letter-spacing:
        -0.045em;
    }

    .page-title p {
      margin:
        6px 0 0;

      color:
        var(--muted);

      font-size:
        14px;

      line-height:
        1.55;
    }

    .top-actions {
      display:
        flex;

      justify-content:
        flex-end;

      flex-wrap:
        wrap;

      gap:
        10px;
    }

    .top-actions form {
      margin:
        0;
    }

    .btn,
    .theme-toggle {
      min-height:
        42px;

      padding:
        0 14px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        8px;

      border:
        1px solid
        var(--line-strong);

      border-radius:
        13px;

      background:
        var(--surface);

      color:
        var(--text);

      box-shadow:
        var(--shadow-sm);

      text-decoration:
        none;

      font-size:
        14px;

      font-weight:
        750;

      cursor:
        pointer;

      transition:
        transform 0.18s ease,
        border-color 0.18s ease,
        background 0.18s ease;
    }

    .btn:hover,
    .theme-toggle:hover {
      transform:
        translateY(
          -1px
        );
    }

    .btn:disabled,
    .theme-toggle:disabled {
      opacity:
        0.6;

      cursor:
        wait;

      transform:
        none;
    }

    .btn-primary {
      color:
        var(--primary-text);

      background:
        var(--primary);

      border-color:
        var(--primary);
    }

    .btn-danger {
      color:
        #ffffff;

      background:
        var(--danger);

      border-color:
        var(--danger);
    }

    .btn-danger:hover {
      color:
        #ffffff;

      background:
        var(--danger-hover);

      border-color:
        var(--danger-hover);
    }

    /*
    |--------------------------------------------------------------------------
    | Theme
    |--------------------------------------------------------------------------
    */

    .theme-toggle {
      width:
        42px;

      padding:
        0;
    }

    .theme-icon {
      width:
        18px;

      height:
        18px;

      display:
        none;

      flex:
        0 0 auto;
    }

    html[data-theme="light"]
    .theme-icon-dark {
      display:
        block;
    }

    html[data-theme="dark"]
    .theme-icon-light {
      display:
        block;
    }

    /*
    |--------------------------------------------------------------------------
    | Alert
    |--------------------------------------------------------------------------
    */

    .page-alert {
      margin-bottom:
        16px;

      padding:
        13px 15px;

      display:
        flex;

      align-items:
        center;

      gap:
        10px;

      border-radius:
        14px;

      font-size:
        13px;

      font-weight:
        750;

      line-height:
        1.5;
    }

    .page-alert-icon {
      width:
        30px;

      height:
        30px;

      display:
        grid;

      place-items:
        center;

      flex:
        0 0 auto;

      border-radius:
        9px;
    }

    .page-alert-icon
    .icon {
      width:
        17px;

      height:
        17px;
    }

    .page-alert-success {
      color:
        #047857;

      background:
        #ecfdf5;

      border:
        1px solid
        #a7f3d0;
    }

    .page-alert-error {
      color:
        #b91c1c;

      background:
        #fef2f2;

      border:
        1px solid
        #fecaca;
    }

    html[data-theme="dark"]
    .page-alert-success {
      color:
        #5eead4;

      background:
        rgba(
          45,
          212,
          191,
          0.1
        );

      border-color:
        rgba(
          45,
          212,
          191,
          0.22
        );
    }

    html[data-theme="dark"]
    .page-alert-error {
      color:
        #fda4af;

      background:
        rgba(
          251,
          113,
          133,
          0.1
        );

      border-color:
        rgba(
          251,
          113,
          133,
          0.22
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Metrics
    |--------------------------------------------------------------------------
    */

    .metrics {
      display:
        grid;

      grid-template-columns:
        repeat(
          4,
          minmax(
            0,
            1fr
          )
        );

      gap:
        16px;

      margin-bottom:
        16px;
    }

    .metric-card {
      padding:
        18px;

      border:
        1px solid
        var(--line);

      border-radius:
        var(--radius-lg);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-sm);
    }

    .metric-head {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        10px;
    }

    .metric-label {
      color:
        var(--muted);

      font-size:
        13px;

      font-weight:
        650;
    }

    .metric-percent {
      padding:
        4px 7px;

      border-radius:
        999px;

      color:
        var(--accent);

      background:
        var(--accent-soft);

      font-size:
        11px;

      font-weight:
        850;
    }

    .metric-value {
      margin:
        13px 0 11px;

      color:
        var(--text-strong);

      font-size:
        34px;

      line-height:
        1;

      letter-spacing:
        -0.05em;
    }

    .progress-track {
      height:
        8px;

      overflow:
        hidden;

      border-radius:
        999px;

      background:
        var(--surface-muted);
    }

    .progress-value {
      height:
        100%;

      border-radius:
        inherit;

      background:
        var(--accent);
    }

    .progress-blue {
      background:
        var(--blue);
    }

    .progress-gray {
      background:
        var(--muted-2);
    }

    .metric-note {
      min-height:
        34px;

      margin-top:
        8px;

      color:
        var(--muted-2);

      font-size:
        12px;

      line-height:
        1.45;
    }

    /*
    |--------------------------------------------------------------------------
    | Search dan filter
    |--------------------------------------------------------------------------
    */

    .control-panel {
      margin-bottom:
        16px;

      padding:
        14px;

      display:
        grid;

      grid-template-columns:
        minmax(
          220px,
          1fr
        )
        auto;

      gap:
        14px;

      border:
        1px solid
        var(--line);

      border-radius:
        var(--radius-lg);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-sm);
    }

    .search-box {
      min-height:
        43px;

      padding:
        0 12px;

      display:
        flex;

      align-items:
        center;

      gap:
        9px;

      border:
        1px solid
        var(--line);

      border-radius:
        12px;

      background:
        var(--surface-soft);
    }

    .search-box
    .icon {
      width:
        18px;

      height:
        18px;

      color:
        var(--muted);
    }

    .search-box input {
      width:
        100%;

      min-width:
        0;

      border:
        0;

      outline:
        0;

      background:
        transparent;

      color:
        var(--text);

      font-size:
        14px;
    }

    .filter-list {
      display:
        flex;

      align-items:
        center;

      justify-content:
        flex-end;

      flex-wrap:
        wrap;

      gap:
        8px;
    }

    .filter-chip {
      min-height:
        39px;

      padding:
        0 11px;

      display:
        inline-flex;

      align-items:
        center;

      gap:
        7px;

      border:
        1px solid
        var(--line);

      border-radius:
        11px;

      background:
        var(--surface-soft);

      color:
        var(--text);

      text-decoration:
        none;

      font-size:
        13px;

      font-weight:
        750;

      transition:
        color 0.18s ease,
        border-color 0.18s ease,
        background 0.18s ease;
    }

    .filter-chip strong {
      min-width:
        24px;

      padding:
        3px 6px;

      border-radius:
        999px;

      color:
        var(--muted);

      background:
        var(--surface-muted);

      text-align:
        center;

      font-size:
        11px;
    }

    .filter-chip:hover,
    .filter-chip.active {
      color:
        var(--accent);

      border-color:
        var(--accent);

      background:
        var(--accent-soft);
    }

    /*
    |--------------------------------------------------------------------------
    | Bulk
    |--------------------------------------------------------------------------
    */

    .bulk-toolbar {
      position:
        sticky;

      top:
        12px;

      z-index:
        20;

      margin-bottom:
        16px;

      padding:
        13px 14px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        14px;

      border:
        1px solid
        var(--line);

      border-radius:
        var(--radius-lg);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-md);
    }

    .bulk-selection-summary,
    .bulk-actions {
      display:
        flex;

      align-items:
        center;

      flex-wrap:
        wrap;

      gap:
        10px;
    }

    .select-all-control,
    .selection-control {
      display:
        inline-flex;

      align-items:
        center;

      gap:
        8px;

      cursor:
        pointer;

      user-select:
        none;
    }

    .select-all-control {
      color:
        var(--text-strong);

      font-size:
        13px;

      font-weight:
        800;
    }

    .selection-control {
      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        750;
    }

    .select-all-control input,
    .selection-control input {
      position:
        absolute;

      opacity:
        0;

      pointer-events:
        none;
    }

    .selection-box {
      width:
        19px;

      height:
        19px;

      display:
        grid;

      place-items:
        center;

      border:
        1.5px solid
        var(--line-strong);

      border-radius:
        6px;

      background:
        var(--surface);

      transition:
        0.16s ease;
    }

    .selection-icon {
      width:
        13px;

      height:
        13px;

      opacity:
        0;

      color:
        var(--primary-text);

      transform:
        scale(
          0.7
        );

      transition:
        0.16s ease;
    }

    .select-all-control
    input:checked
    +
    .selection-box,
    .selection-control
    input:checked
    +
    .selection-box {
      border-color:
        var(--primary);

      background:
        var(--primary);
    }

    .select-all-control
    input:checked
    +
    .selection-box
    .selection-icon,
    .selection-control
    input:checked
    +
    .selection-box
    .selection-icon {
      opacity:
        1;

      transform:
        scale(
          1
        );
    }

    .selected-count {
      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        750;
    }

    .bulk-btn {
      min-height:
        40px;

      padding:
        0 13px;

      border:
        0;

      border-radius:
        11px;

      color:
        var(--primary-text);

      background:
        var(--primary);

      font-size:
        13px;

      font-weight:
        850;

      cursor:
        pointer;

      transition:
        transform 0.18s ease,
        opacity 0.18s ease;
    }

    .bulk-btn-blue {
      color:
        #ffffff;

      background:
        var(--blue);
    }

    .bulk-btn:hover:not(
      :disabled
    ) {
      transform:
        translateY(
          -1px
        );
    }

    .bulk-btn:disabled {
      opacity:
        0.5;

      cursor:
        not-allowed;
    }

    /*
    |--------------------------------------------------------------------------
    | Gallery
    |--------------------------------------------------------------------------
    */

    .gallery-meta {
      margin:
        0 0 12px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        12px;

      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        700;
    }

    .gallery-grid {
      display:
        grid;

      grid-template-columns:
        repeat(
          3,
          minmax(
            0,
            1fr
          )
        );

      align-items:
        start;

      gap:
        16px;
    }

    .dataset-card {
      overflow:
        hidden;

      border:
        1px solid
        var(--line);

      border-radius:
        var(--radius-lg);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-sm);

      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
    }

    .dataset-card:hover {
      transform:
        translateY(
          -2px
        );

      box-shadow:
        var(--shadow-md);
    }

    .dataset-card.selected {
      border-color:
        var(--accent);

      box-shadow:
        0 0 0 3px
        var(--accent-soft),
        var(--shadow-md);
    }

    .dataset-card.search-hidden {
      display:
        none;
    }

    .card-selection {
      min-height:
        40px;

      padding:
        0 12px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      border-bottom:
        1px solid
        var(--line);

      background:
        var(--surface-soft);
    }

    .card-number {
      color:
        var(--muted-2);

      font-size:
        11px;

      font-weight:
        750;
    }

    .image-frame {
      position:
        relative;

      display:
        block;

      aspect-ratio:
        4 / 3;

      overflow:
        hidden;

      background:
        var(--surface-muted);

      border-bottom:
        1px solid
        var(--line);
    }

    .image-frame img {
      width:
        100%;

      height:
        100%;

      display:
        block;

      object-fit:
        cover;

      transition:
        transform 0.25s ease;
    }

    .dataset-card:hover
    .image-frame img {
      transform:
        scale(
          1.025
        );
    }

    .image-placeholder {
      width:
        100%;

      height:
        100%;

      display:
        grid;

      place-items:
        center;

      align-content:
        center;

      gap:
        9px;

      color:
        var(--muted);

      font-size:
        12px;
    }

    .placeholder-icon {
      width:
        34px;

      height:
        34px;

      color:
        var(--muted-2);
    }

    .image-badge {
      position:
        absolute;

      left:
        12px;

      bottom:
        12px;

      padding:
        6px 9px;

      border-radius:
        999px;

      font-size:
        11px;

      font-weight:
        850;

      box-shadow:
        0 8px 20px
        rgba(
          15,
          23,
          42,
          0.14
        );

      backdrop-filter:
        blur(
          8px
        );
    }

    .badge-medical {
      color:
        #047857;

      background:
        rgba(
          236,
          253,
          245,
          0.92
        );
    }

    .badge-nonmedical {
      color:
        #1d4ed8;

      background:
        rgba(
          239,
          246,
          255,
          0.92
        );
    }

    .badge-unknown {
      color:
        #475569;

      background:
        rgba(
          248,
          250,
          252,
          0.92
        );
    }

    .card-body {
      padding:
        14px;
    }

    .card-heading {
      display:
        flex;

      align-items:
        flex-start;

      justify-content:
        space-between;

      gap:
        10px;
    }

    .card-title-wrap {
      min-width:
        0;
    }

    .source-label {
      color:
        var(--accent);

      font-size:
        10px;

      font-weight:
        850;

      letter-spacing:
        0.08em;

      text-transform:
        uppercase;
    }

    .card-title-wrap h3 {
      margin:
        5px 0 0;

      overflow:
        hidden;

      color:
        var(--text-strong);

      font-size:
        14px;

      line-height:
        1.45;

      white-space:
        nowrap;

      text-overflow:
        ellipsis;
    }

    .icon-link {
      width:
        34px;

      height:
        34px;

      display:
        grid;

      place-items:
        center;

      flex:
        0 0 auto;

      border:
        1px solid
        var(--line);

      border-radius:
        10px;

      color:
        var(--muted);

      background:
        var(--surface-soft);

      text-decoration:
        none;

      transition:
        color 0.18s ease,
        border-color 0.18s ease;
    }

    .icon-link
    .icon {
      width:
        16px;

      height:
        16px;
    }

    .icon-link:hover {
      color:
        var(--accent);

      border-color:
        var(--accent);
    }

    .metadata-row {
      margin-top:
        12px;

      display:
        flex;

      flex-wrap:
        wrap;

      gap:
        6px;
    }

    .metadata-row span {
      padding:
        5px 8px;

      border:
        1px solid
        var(--line);

      border-radius:
        8px;

      color:
        var(--muted);

      background:
        var(--surface-soft);

      font-size:
        11px;

      font-weight:
        700;
    }

    /*
    |--------------------------------------------------------------------------
    | Form label
    |--------------------------------------------------------------------------
    */

    .single-label-form {
      margin-top:
        13px;

      padding:
        11px;

      border:
        1px solid
        var(--line);

      border-radius:
        13px;

      background:
        var(--surface-soft);
    }

    .single-label-copy label,
    .single-label-copy small {
      display:
        block;
    }

    .single-label-copy label {
      color:
        var(--text-strong);

      font-size:
        12px;

      font-weight:
        850;
    }

    .single-label-copy small {
      margin-top:
        3px;

      color:
        var(--muted-2);

      font-size:
        10px;

      line-height:
        1.4;
    }

    .single-label-controls {
      margin-top:
        9px;

      display:
        grid;

      grid-template-columns:
        minmax(
          0,
          1fr
        )
        auto;

      gap:
        8px;
    }

    .single-label-controls
    select,
    .limit-select {
      min-height:
        39px;

      padding:
        0 10px;

      border:
        1px solid
        var(--line-strong);

      border-radius:
        10px;

      outline:
        0;

      color:
        var(--text);

      background:
        var(--surface);

      font-size:
        12px;

      font-weight:
        750;
    }

    .single-label-controls
    select:focus,
    .limit-select:focus {
      border-color:
        var(--accent);

      box-shadow:
        0 0 0 3px
        var(--accent-soft);
    }

    .save-one-btn {
      min-height:
        39px;

      padding:
        0 13px;

      border:
        0;

      border-radius:
        10px;

      color:
        var(--primary-text);

      background:
        var(--primary);

      font-size:
        12px;

      font-weight:
        850;

      cursor:
        pointer;
    }

    .save-one-btn:disabled {
      opacity:
        0.6;

      cursor:
        wait;
    }

    /*
    |--------------------------------------------------------------------------
    | Empty
    |--------------------------------------------------------------------------
    */

    .empty-state {
      grid-column:
        1 / -1;

      padding:
        56px 20px;

      display:
        grid;

      place-items:
        center;

      border:
        1px dashed
        var(--line-strong);

      border-radius:
        var(--radius-xl);

      background:
        var(--surface);

      text-align:
        center;
    }

    .empty-icon {
      width:
        56px;

      height:
        56px;

      margin-bottom:
        14px;

      display:
        grid;

      place-items:
        center;

      border-radius:
        17px;

      color:
        var(--accent);

      background:
        var(--accent-soft);
    }

    .empty-state h2 {
      margin:
        0 0 7px;

      color:
        var(--text-strong);

      font-size:
        20px;
    }

    .empty-state p {
      max-width:
        480px;

      margin:
        0 0 17px;

      color:
        var(--muted);

      font-size:
        13px;

      line-height:
        1.6;
    }

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    .pagination-panel {
      margin-top:
        18px;

      padding:
        13px 14px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        14px;

      border:
        1px solid
        var(--line);

      border-radius:
        var(--radius-lg);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-sm);
    }

    .page-limit {
      display:
        flex;

      align-items:
        center;

      gap:
        9px;

      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        750;
    }

    .limit-select {
      min-width:
        76px;
    }

    .pagination-links {
      display:
        flex;

      align-items:
        center;

      justify-content:
        flex-end;

      flex-wrap:
        wrap;

      gap:
        6px;
    }

    .page-nav,
    .page-number {
      min-width:
        38px;

      min-height:
        38px;

      padding:
        0 10px;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        5px;

      border:
        1px solid
        var(--line);

      border-radius:
        10px;

      color:
        var(--text);

      background:
        var(--surface-soft);

      text-decoration:
        none;

      font-size:
        12px;

      font-weight:
        800;
    }

    .page-nav
    .icon {
      width:
        16px;

      height:
        16px;
    }

    .page-number:hover,
    .page-number.active,
    .page-nav:hover {
      color:
        var(--accent);

      border-color:
        var(--accent);

      background:
        var(--accent-soft);
    }

    .page-nav.disabled {
      opacity:
        0.38;

      pointer-events:
        none;
    }

    .page-gap {
      padding:
        0 3px;

      color:
        var(--muted-2);
    }

    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    .footer-note {
      margin-top:
        18px;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      flex-wrap:
        wrap;

      gap:
        14px;

      color:
        var(--muted-2);

      font-size:
        12px;
    }

    .footer-note strong {
      color:
        var(--muted);

      font-weight:
        750;
    }

    /*
    |--------------------------------------------------------------------------
    | Toast
    |--------------------------------------------------------------------------
    */

    .toast {
      position:
        fixed;

      top:
        20px;

      right:
        20px;

      z-index:
        10000;

      width:
        min(
          420px,
          calc(
            100vw - 32px
          )
        );

      padding:
        14px 15px;

      border-radius:
        14px;

      color:
        #ffffff;

      background:
        #1d4ed8;

      box-shadow:
        0 20px 50px
        rgba(
          15,
          23,
          42,
          0.25
        );

      opacity:
        0;

      pointer-events:
        none;

      transform:
        translateY(
          -12px
        );

      transition:
        opacity 0.2s ease,
        transform 0.2s ease;
    }

    .toast.show {
      opacity:
        1;

      transform:
        translateY(
          0
        );
    }

    .toast.success {
      background:
        #047857;
    }

    .toast.error {
      background:
        #dc2626;
    }

    .toast.warning {
      background:
        #b45309;
    }

    .toast-title,
    .toast-message {
      display:
        block;
    }

    .toast-title {
      margin-bottom:
        2px;

      font-size:
        13px;

      font-weight:
        850;
    }

    .toast-message {
      font-size:
        12px;

      line-height:
        1.5;

      opacity:
        0.92;
    }

    /*
    |--------------------------------------------------------------------------
    | Processing overlay
    |--------------------------------------------------------------------------
    */

    .processing-overlay {
      position:
        fixed;

      inset:
        0;

      z-index:
        9999;

      display:
        none;

      place-items:
        center;

      padding:
        20px;

      background:
        rgba(
          2,
          6,
          23,
          0.48
        );

      backdrop-filter:
        blur(
          5px
        );
    }

    .processing-overlay.show {
      display:
        grid;
    }

    .processing-card {
      width:
        min(
          420px,
          100%
        );

      padding:
        22px;

      border:
        1px solid
        var(--line);

      border-radius:
        18px;

      background:
        var(--surface);

      box-shadow:
        var(--shadow-md);

      text-align:
        center;
    }

    .spinner {
      width:
        34px;

      height:
        34px;

      margin:
        0 auto 13px;

      border:
        3px solid
        var(--surface-muted);

      border-top-color:
        var(--accent);

      border-radius:
        50%;

      animation:
        spin 0.8s
        linear infinite;
    }

    .processing-card strong,
    .processing-card span {
      display:
        block;
    }

    .processing-card strong {
      color:
        var(--text-strong);

      font-size:
        15px;
    }

    .processing-card span {
      margin-top:
        6px;

      color:
        var(--muted);

      font-size:
        12px;

      line-height:
        1.5;
    }

    @keyframes spin {
      to {
        transform:
          rotate(
            360deg
          );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Responsive
    |--------------------------------------------------------------------------
    */

    @media (
      max-width:
        1180px
    ) {
      .gallery-grid {
        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );
      }

      .metrics {
        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );
      }
    }

    @media (
      max-width:
        1120px
    ) {
      .app {
        grid-template-columns:
          1fr;
      }

      .sidebar {
        position:
          static;

        height:
          auto;

        border-right:
          none;
      }

      .sidebar-footer {
        position:
          static;

        margin-top:
          18px;
      }

      .main {
        padding:
          20px;
      }

      .nav {
        grid-template-columns:
          repeat(
            3,
            minmax(
              0,
              1fr
            )
          );
      }

      .control-panel {
        grid-template-columns:
          1fr;
      }

      .filter-list {
        justify-content:
          flex-start;
      }
    }

    @media (
      max-width:
        720px
    ) {
      .sidebar {
        padding:
          18px;
      }

      .main {
        padding:
          14px;
      }

      .topbar,
      .bulk-toolbar,
      .pagination-panel {
        align-items:
          stretch;

        flex-direction:
          column;
      }

      .top-actions {
        justify-content:
          flex-start;
      }

      .gallery-grid,
      .metrics {
        grid-template-columns:
          1fr;
      }

      .pagination-links {
        justify-content:
          flex-start;
      }

      .nav {
        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );
      }
    }

    @media (
      max-width:
        480px
    ) {
      .top-actions
      .btn,
      .top-actions
      form,
      .top-actions
      form
      .btn {
        width:
          100%;
      }

      .single-label-controls {
        grid-template-columns:
          1fr;
      }

      .save-one-btn,
      .bulk-btn {
        width:
          100%;
      }

      .bulk-selection-summary,
      .bulk-actions {
        width:
          100%;
      }

      .filter-chip {
        flex:
          1 1
          calc(
            50% - 8px
          );

        justify-content:
          space-between;
      }

      .page-nav span {
        display:
          none;
      }
    }
  </style>
</head>

<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          ${brandCameraIcon()}
        </div>

        <div>
          <div class="brand-title">
            Capture Panel
          </div>

          <div class="brand-subtitle">
            ESP32-CAM Dataset
          </div>
        </div>
      </div>

      <nav class="nav">
        <a href="/">
          ${icon("grid")}
          Dashboard
        </a>

        <a
          class="active"
          href="/gallery"
          aria-current="page"
        >
          ${icon("camera")}
          Gallery
        </a>

        <a href="/summary">
          ${icon("chart")}
          Summary
        </a>

        <a href="/test-upload">
          ${icon("upload")}
          Upload
        </a>

        <a href="/docs">
          ${icon("file")}
          Docs
        </a>

        <a href="/status">
          ${icon("settings")}
          Settings
        </a>
      </nav>

      <div class="sidebar-footer">
        <span>
          Storage folder
        </span>

        <strong>
          ${escapeHtml(
            CLOUDINARY_FOLDER
          )}
        </strong>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="page-title">
          <h1>
            Galeri Dataset Limbah
          </h1>

          <p>
            Menampilkan
            ${startItem}-${endItem}
            dari
            ${totalItems}
            data pada filter

            <strong>
              ${escapeHtml(
                filterName
              )}
            </strong>.
          </p>
        </div>

        <div class="top-actions">
          <button
            class="theme-toggle"
            id="themeToggle"
            type="button"
            aria-label="Aktifkan mode gelap"
            title="Aktifkan mode gelap"
            aria-pressed="false"
          >
            ${iconMoon()}
            ${iconSun()}
          </button>

          <form
            method="POST"
            action="/sync-cloudinary"
            class="sync-form"
          >
            <input
              type="hidden"
              name="label"
              value="${escapeHtml(
                selectedLabel
              )}"
            />

            <input
              type="hidden"
              name="limit"
              value="${limit}"
            />

            <button
              class="btn"
              type="submit"
            >
              ${icon("refresh")}
              Sinkronkan
            </button>
          </form>

          <form
            method="POST"
            action="/clear-local-data"
            class="clear-local-form"
          >
            <input
              type="hidden"
              name="limit"
              value="${limit}"
            />

            <button
              class="btn btn-danger"
              type="submit"
            >
              ${icon("trash")}
              Hapus data lokal
            </button>
          </form>

          <a
            class="btn"
            href="/summary"
          >
            ${icon("chart")}
            Summary
          </a>

          <a
            class="btn btn-primary"
            href="/test-upload"
          >
            ${icon("upload")}
            Upload image
          </a>
        </div>
      </header>

      ${notificationHtml}

      <section class="metrics">
        <article class="metric-card">
          <div class="metric-head">
            <span class="metric-label">
              Total dataset
            </span>

            <span class="metric-percent">
              ${totalProgress}%
            </span>
          </div>

          <div class="metric-value">
            <strong>${total}</strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-value"
              style="width:${totalProgress}%"
            ></div>
          </div>

          <div class="metric-note">
            Target
            ${DATASET_TARGET}
            gambar.
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-head">
            <span class="metric-label">
              Medis
            </span>

            <span class="metric-percent">
              ${medisProgress}%
            </span>
          </div>

          <div class="metric-value">
            <strong>${medis}</strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-value"
              style="width:${medisProgress}%"
            ></div>
          </div>

          <div class="metric-note">
            Target
            ${CLASS_TARGET}
            gambar.
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-head">
            <span class="metric-label">
              Non-medis
            </span>

            <span class="metric-percent">
              ${nonMedisProgress}%
            </span>
          </div>

          <div class="metric-value">
            <strong>${nonMedis}</strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-value progress-blue"
              style="width:${nonMedisProgress}%"
            ></div>
          </div>

          <div class="metric-note">
            Target
            ${CLASS_TARGET}
            gambar.
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-head">
            <span class="metric-label">
              Unknown
            </span>

            <span class="metric-percent">
              ${unknownProgress}%
            </span>
          </div>

          <div class="metric-value">
            <strong>${unknown}</strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-value progress-gray"
              style="width:${unknownProgress}%"
            ></div>
          </div>

          <div class="metric-note">
            Data yang belum
            memiliki label valid.
          </div>
        </article>
      </section>

      <section class="control-panel">
        <label
          class="search-box"
          for="gallerySearch"
        >
          ${icon("search")}

          <input
            id="gallerySearch"
            type="search"
            placeholder="Cari public_id atau sumber pada halaman ini..."
            autocomplete="off"
          />
        </label>

        <div class="filter-list">
          ${filterLinks}
        </div>
      </section>

      <section class="bulk-toolbar">
        <div
          class="bulk-selection-summary"
        >
          <label
            class="select-all-control"
          >
            <input
              type="checkbox"
              id="selectAll"
            />

            <span
              class="selection-box"
            >
              ${icon(
                "check",
                "selection-icon"
              )}
            </span>

            <span>
              Pilih semua yang terlihat
            </span>
          </label>

          <span
            class="selected-count"
            id="selectedCount"
          >
            0 gambar dipilih
          </span>
        </div>

        <div class="bulk-actions">
          <button
            type="button"
            class="bulk-btn"
            data-label="medis"
            disabled
          >
            Ubah ke Medis
          </button>

          <button
            type="button"
            class="bulk-btn bulk-btn-blue"
            data-label="non_medis"
            disabled
          >
            Ubah ke Non-medis
          </button>
        </div>
      </section>

      <div class="gallery-meta">
        <span id="visibleResult">
          ${pageUploads.length}
          kartu pada halaman
          ${page}
        </span>

        <span>
          Halaman
          ${page}
          dari
          ${totalPages}
        </span>
      </div>

      <section
        class="gallery-grid"
        id="galleryGrid"
      >
        ${cards}
      </section>

      <section class="pagination-panel">
        <label
          class="page-limit"
          for="limitSelect"
        >
          Tampilkan

          <select
            class="limit-select"
            id="limitSelect"
          >
            ${allowedLimits
              .map(
                (value) => `
                  <option
                    value="${value}"
                    ${
                      value ===
                      limit
                        ? "selected"
                        : ""
                    }
                  >
                    ${value}
                  </option>
                `
              )
              .join("")}
          </select>

          data per halaman
        </label>

        <div class="pagination-links">
          <a
            class="page-nav ${
              page <= 1
                ? "disabled"
                : ""
            }"
            href="${buildGalleryUrl({
              page:
                Math.max(
                  1,
                  page - 1
                ),

              limit,

              label:
                selectedLabel,
            })}"
          >
            ${icon("chevronLeft")}

            <span>
              Sebelumnya
            </span>
          </a>

          ${numberedLinks}

          <a
            class="page-nav ${
              page >=
              totalPages
                ? "disabled"
                : ""
            }"
            href="${buildGalleryUrl({
              page:
                Math.min(
                  totalPages,
                  page + 1
                ),

              limit,

              label:
                selectedLabel,
            })}"
          >
            <span>
              Berikutnya
            </span>

            ${icon("chevronRight")}
          </a>
        </div>
      </section>

      <footer class="footer-note">
        <span>
          Bulk update hanya
          memproses kartu yang
          dipilih pada halaman aktif.
        </span>

        <strong>
          ©
          ${new Date().getFullYear()}
          Reni Kartika Suwandi.
        </strong>
      </footer>
    </main>
  </div>

  <div
    class="toast"
    id="toast"
    role="status"
    aria-live="polite"
  >
    <span
      class="toast-title"
      id="toastTitle"
    ></span>

    <span
      class="toast-message"
      id="toastMessage"
    ></span>
  </div>

  <div
    class="processing-overlay"
    id="processingOverlay"
    aria-hidden="true"
  >
    <div class="processing-card">
      <div class="spinner"></div>

      <strong
        id="processingTitle"
      >
        Memproses label
      </strong>

      <span
        id="processingMessage"
      >
        Data lokal sedang diperbarui.
      </span>
    </div>
  </div>

  <script>
    const root =
      document.documentElement;

    const themeToggle =
      document.getElementById(
        "themeToggle"
      );

    const selectAll =
      document.getElementById(
        "selectAll"
      );

    const selectedCount =
      document.getElementById(
        "selectedCount"
      );

    const limitSelect =
      document.getElementById(
        "limitSelect"
      );

    const searchInput =
      document.getElementById(
        "gallerySearch"
      );

    const visibleResult =
      document.getElementById(
        "visibleResult"
      );

    const toast =
      document.getElementById(
        "toast"
      );

    const toastTitle =
      document.getElementById(
        "toastTitle"
      );

    const toastMessage =
      document.getElementById(
        "toastMessage"
      );

    const processingOverlay =
      document.getElementById(
        "processingOverlay"
      );

    const processingTitle =
      document.getElementById(
        "processingTitle"
      );

    const processingMessage =
      document.getElementById(
        "processingMessage"
      );

    const GALLERY_THEME_STORAGE_KEY =
      "capture-panel-gallery-theme";

    let toastTimer =
      null;

    /*
    |--------------------------------------------------------------------------
    | Toast
    |--------------------------------------------------------------------------
    */

    function showToast(
      title,
      message,
      type = "info"
    ) {
      if (
        !toast ||
        !toastTitle ||
        !toastMessage
      ) {
        return;
      }

      window.clearTimeout(
        toastTimer
      );

      toast.className =
        "toast " +
        type +
        " show";

      toastTitle.textContent =
        title;

      toastMessage.textContent =
        message;

      toastTimer =
        window.setTimeout(
          function () {
            toast
              .classList
              .remove(
                "show"
              );
          },
          5000
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Processing
    |--------------------------------------------------------------------------
    */

    function showProcessing(
      title,
      message
    ) {
      if (
        processingTitle
      ) {
        processingTitle
          .textContent =
          title;
      }

      if (
        processingMessage
      ) {
        processingMessage
          .textContent =
          message;
      }

      if (
        processingOverlay
      ) {
        processingOverlay
          .classList
          .add(
            "show"
          );

        processingOverlay
          .setAttribute(
            "aria-hidden",
            "false"
          );
      }
    }

    function hideProcessing() {
      if (
        processingOverlay
      ) {
        processingOverlay
          .classList
          .remove(
            "show"
          );

        processingOverlay
          .setAttribute(
            "aria-hidden",
            "true"
          );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Card helper
    |--------------------------------------------------------------------------
    */

    function getCards() {
      return Array.from(
        document
          .querySelectorAll(
            ".dataset-card"
          )
      );
    }

    function getVisibleCards() {
      return getCards()
        .filter(
          function (
            card
          ) {
            return (
              !card
                .classList
                .contains(
                  "search-hidden"
                )
            );
          }
        );
    }

    function getVisibleCheckboxes() {
      return getVisibleCards()
        .map(
          function (
            card
          ) {
            return card
              .querySelector(
                ".select-image"
              );
          }
        )
        .filter(Boolean);
    }

    function getSelectedCheckboxes() {
      return Array.from(
        document
          .querySelectorAll(
            ".select-image:checked"
          )
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Selection
    |--------------------------------------------------------------------------
    */

    function updateSelectionState() {
      const visibleCheckboxes =
        getVisibleCheckboxes();

      const selectedCheckboxes =
        getSelectedCheckboxes();

      const selectedVisible =
        visibleCheckboxes
          .filter(
            function (
              checkbox
            ) {
              return (
                checkbox.checked
              );
            }
          );

      getCards()
        .forEach(
          function (
            card
          ) {
            const checkbox =
              card.querySelector(
                ".select-image"
              );

            card
              .classList
              .toggle(
                "selected",

                Boolean(
                  checkbox &&
                  checkbox.checked
                )
              );
          }
        );

      if (
        selectedCount
      ) {
        selectedCount
          .textContent =
          selectedCheckboxes
            .length +
          " gambar dipilih";
      }

      if (
        selectAll
      ) {
        selectAll.checked =
          visibleCheckboxes
            .length > 0 &&
          selectedVisible
            .length ===
            visibleCheckboxes
              .length;

        selectAll.indeterminate =
          selectedVisible
            .length > 0 &&
          selectedVisible
            .length <
            visibleCheckboxes
              .length;
      }

      document
        .querySelectorAll(
          ".bulk-btn"
        )
        .forEach(
          function (
            button
          ) {
            button.disabled =
              selectedCheckboxes
                .length === 0;
          }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    function applySearch() {
      const query =
        String(
          searchInput
            ? searchInput.value
            : ""
        )
          .trim()
          .toLowerCase();

      let visibleCount =
        0;

      getCards()
        .forEach(
          function (
            card
          ) {
            const publicId =
              card.dataset
                .publicId ||
              "";

            const source =
              card.dataset
                .source ||
              "";

            const matches =
              !query ||
              publicId
                .includes(
                  query
                ) ||
              source
                .includes(
                  query
                );

            card
              .classList
              .toggle(
                "search-hidden",
                !matches
              );

            if (
              matches
            ) {
              visibleCount +=
                1;
            }
          }
        );

      if (
        visibleResult
      ) {
        visibleResult
          .textContent =
          visibleCount +
          " kartu terlihat pada halaman ${page}" +
          (
            query
              ? " setelah pencarian"
              : ""
          );
      }

      updateSelectionState();
    }

    /*
    |--------------------------------------------------------------------------
    | Tema mandiri Gallery
    |--------------------------------------------------------------------------
    */

    function updateThemeToggle(
      theme
    ) {
      if (
        !themeToggle
      ) {
        return;
      }

      const actionLabel =
        theme === "dark"
          ? "Aktifkan mode terang"
          : "Aktifkan mode gelap";

      themeToggle
        .setAttribute(
          "aria-label",
          actionLabel
        );

      themeToggle
        .setAttribute(
          "title",
          actionLabel
        );

      themeToggle
        .setAttribute(
          "aria-pressed",

          theme === "dark"
            ? "true"
            : "false"
        );
    }

    function applyGalleryTheme(
      theme,
      persist = true
    ) {
      const validTheme =
        theme === "dark"
          ? "dark"
          : "light";

      root.setAttribute(
        "data-theme",
        validTheme
      );

      root.style.colorScheme =
        validTheme;

      updateThemeToggle(
        validTheme
      );

      if (
        !persist
      ) {
        return;
      }

      try {
        localStorage.setItem(
          GALLERY_THEME_STORAGE_KEY,
          validTheme
        );
      } catch (
        error
      ) {
        console.warn(
          "Tema Gallery tidak dapat disimpan:",

          error.message
        );
      }
    }

    if (
      themeToggle
    ) {
      updateThemeToggle(
        root.getAttribute(
          "data-theme"
        )
      );

      themeToggle
        .addEventListener(
          "click",

          function () {
            const currentTheme =
              root.getAttribute(
                "data-theme"
              );

            const nextTheme =
              currentTheme ===
              "dark"
                ? "light"
                : "dark";

            applyGalleryTheme(
              nextTheme,
              true
            );
          }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Search dan checkbox
    |--------------------------------------------------------------------------
    */

    searchInput
      ?.addEventListener(
        "input",
        applySearch
      );

    selectAll
      ?.addEventListener(
        "change",

        function () {
          getVisibleCheckboxes()
            .forEach(
              function (
                checkbox
              ) {
                checkbox.checked =
                  selectAll.checked;
              }
            );

          updateSelectionState();
        }
      );

    document
      .addEventListener(
        "change",

        function (
          event
        ) {
          if (
            event.target
              .matches(
                ".select-image"
              )
          ) {
            updateSelectionState();
          }
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Limit pagination
    |--------------------------------------------------------------------------
    */

    limitSelect
      ?.addEventListener(
        "change",

        function () {
          const query =
            new URLSearchParams(
              window
                .location
                .search
            );

          query.set(
            "page",
            "1"
          );

          query.set(
            "limit",
            limitSelect.value
          );

          query.set(
            "label",
            "${selectedLabel}"
          );

          window.location.href =
            "/gallery?" +
            query.toString();
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Single label
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".single-label-form"
      )
      .forEach(
        function (
          form
        ) {
          form.addEventListener(
            "submit",

            function () {
              const button =
                form.querySelector(
                  ".save-one-btn"
                );

              if (
                button
              ) {
                button.disabled =
                  true;

                button.textContent =
                  "Menyimpan...";
              }
            }
          );
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Sinkronisasi
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".sync-form"
      )
      .forEach(
        function (
          form
        ) {
          form.addEventListener(
            "submit",

            function () {
              const button =
                form.querySelector(
                  "button"
                );

              if (
                button
              ) {
                button.disabled =
                  true;

                button.textContent =
                  "Sinkronisasi...";
              }
            }
          );
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Hapus metadata lokal
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".clear-local-form"
      )
      .forEach(
        function (
          form
        ) {
          form.addEventListener(
            "submit",

            function (
              event
            ) {
              const confirmed =
                window.confirm(
                  "Hapus seluruh metadata lokal dari dashboard dan galeri? " +
                  "Tindakan ini tidak menghapus gambar Cloudinary."
                );

              if (
                !confirmed
              ) {
                event.preventDefault();
                return;
              }

              const button =
                form.querySelector(
                  "button"
                );

              if (
                button
              ) {
                button.disabled =
                  true;

                button.textContent =
                  "Menghapus...";
              }
            }
          );
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Bulk label
    |--------------------------------------------------------------------------
    */

    document
      .querySelectorAll(
        ".bulk-btn"
      )
      .forEach(
        function (
          button
        ) {
          button.addEventListener(
            "click",

            async function () {
              const selected =
                getSelectedCheckboxes();

              const publicIds =
                selected.map(
                  function (
                    checkbox
                  ) {
                    return (
                      checkbox.value
                    );
                  }
                );

              const newLabel =
                button.dataset
                  .label;

              const labelText =
                newLabel ===
                "medis"
                  ? "Medis"
                  : "Non-medis";

              if (
                publicIds.length ===
                0
              ) {
                showToast(
                  "Belum ada pilihan",

                  "Pilih minimal satu gambar terlebih dahulu.",

                  "error"
                );

                return;
              }

              const confirmed =
                window.confirm(
                  "Ubah " +
                  publicIds.length +
                  " gambar menjadi " +
                  labelText +
                  "?"
                );

              if (
                !confirmed
              ) {
                return;
              }

              document
                .querySelectorAll(
                  ".bulk-btn"
                )
                .forEach(
                  function (
                    item
                  ) {
                    item.disabled =
                      true;
                  }
                );

              showProcessing(
                "Memperbarui " +
                  publicIds.length +
                  " label",

                "Data lokal sedang disimpan."
              );

              const controller =
                new AbortController();

              const timeoutId =
                window.setTimeout(
                  function () {
                    controller
                      .abort();
                  },

                  30000
                );

              try {
                const response =
                  await fetch(
                    "/api/update-labels-bulk",

                    {
                      method:
                        "POST",

                      headers: {
                        "Content-Type":
                          "application/json",

                        Accept:
                          "application/json",
                      },

                      credentials:
                        "same-origin",

                      cache:
                        "no-store",

                      signal:
                        controller.signal,

                      body:
                        JSON.stringify({
                          public_ids:
                            publicIds,

                          label:
                            newLabel,
                        }),
                    }
                  );

                const responseText =
                  await response.text();

                let result = {};

                try {
                  result =
                    responseText
                      ? JSON.parse(
                          responseText
                        )
                      : {};
                } catch (
                  parseError
                ) {
                  throw new Error(
                    "Respons backend bukan JSON. Status HTTP " +
                    response.status +
                    "."
                  );
                }

                if (
                  !response.ok ||
                  result.success !==
                    true
                ) {
                  throw new Error(
                    result.message ||
                    "Bulk update label gagal."
                  );
                }

                hideProcessing();

                showToast(
                  "Bulk update berhasil",

                  result.message ||
                  publicIds.length +
                  " label berhasil diperbarui.",

                  "success"
                );

                window.setTimeout(
                  function () {
                    window.location
                      .reload();
                  },

                  900
                );
              } catch (
                error
              ) {
                hideProcessing();

                const message =
                  error.name ===
                  "AbortError"
                    ? "Respons backend melewati batas waktu. Data mungkin sudah tersimpan."
                    : "Respons koneksi terputus. Data mungkin sudah tersimpan di server.";

                showToast(
                  "Status respons tidak diterima",

                  message +
                  " Halaman akan dimuat ulang untuk memeriksa hasil.",

                  "warning"
                );

                window.setTimeout(
                  function () {
                    window.location
                      .reload();
                  },

                  1600
                );
              } finally {
                window.clearTimeout(
                  timeoutId
                );
              }
            }
          );
        }
      );

    updateSelectionState();
  </script>
</body>
</html>
  `;
}

module.exports =
  galleryView;
