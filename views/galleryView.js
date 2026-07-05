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

function safeNumber(
  value,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed) &&
    parsed >= 0
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

  if (value === "medis") {
    return "medis";
  }

  if (value === "non_medis") {
    return "non_medis";
  }

  return "unknown";
}

function formatLabel(
  label = ""
) {
  const normalized =
    normalizeLabel(label);

  if (normalized === "medis") {
    return "Medis";
  }

  if (
    normalized ===
    "non_medis"
  ) {
    return "Non-medis";
  }

  return "Unknown";
}

function normalizeFilter(
  label = "all"
) {
  const value = String(label)
    .trim()
    .toLowerCase()
    .replace(
      /[\s-]+/g,
      "_"
    );

  return [
    "all",
    "medis",
    "non_medis",
    "unknown",
  ].includes(value)
    ? value
    : "all";
}

function normalizeLimit(
  value
) {
  const parsed = Math.trunc(
    safeNumber(
      value,
      100
    )
  );

  return [
    20,
    50,
    100,
  ].includes(parsed)
    ? parsed
    : 100;
}

/*
|--------------------------------------------------------------------------
| Membuat URL Gallery
|--------------------------------------------------------------------------
|
| cursor digunakan sebagai pagination utama.
|
| page hanya digunakan sebagai fallback sementara
| apabila repository lama masih mengirim nextPage.
|
*/

function buildGalleryUrl({
  cursor = "",
  page = null,
  limit = 100,
  label = "all",
} = {}) {
  const query =
    new URLSearchParams({
      limit:
        String(
          normalizeLimit(limit)
        ),

      label:
        normalizeFilter(label),
    });

  const safeCursor =
    String(
      cursor || ""
    ).trim();

  if (safeCursor) {
    query.set(
      "cursor",
      safeCursor
    );
  } else if (
    Number.isInteger(
      Number(page)
    ) &&
    Number(page) > 1
  ) {
    query.set(
      "page",
      String(Number(page))
    );
  }

  return (
    `/gallery?${query.toString()}`
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
| Ikon Logo
|--------------------------------------------------------------------------
*/

function brandCameraIcon() {
  return icon(
    "camera",
    "icon brand-camera-icon"
  );
}

/*
|--------------------------------------------------------------------------
| Ikon Tema
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

  /*
  |--------------------------------------------------------------------------
  | Summary
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const limit =
    normalizeLimit(
      pagination.limit
    );

  const totalItems =
    Math.trunc(
      safeNumber(
        pagination.totalItems,
        pageUploads.length
      )
    );

  const selectedLabel =
    normalizeFilter(
      pagination.selectedLabel ||
        pagination.label ||
        "all"
    );

  const currentCursor =
    String(
      pagination.cursor || ""
    ).trim();

  const nextCursor =
    String(
      pagination.nextCursor ||
        pagination.next_cursor ||
        ""
    ).trim();

  /*
   * Fallback sementara untuk repository
   * yang masih menggunakan pagination angka.
   */

  const fallbackNextPage =
    Number(
      pagination.nextPage
    );

  const hasCursorNext =
    Boolean(nextCursor);

  const hasFallbackNext =
    !hasCursorNext &&
    pagination.hasNextPage ===
      true &&
    Number.isInteger(
      fallbackNextPage
    ) &&
    fallbackNextPage > 1;

  const hasMore =
    pagination.hasMore ===
    false
      ? false
      : hasCursorNext ||
        hasFallbackNext;

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

  const nextUrl =
    hasCursorNext
      ? buildGalleryUrl({
          cursor:
            nextCursor,

          limit,

          label:
            selectedLabel,
        })
      : hasFallbackNext
      ? buildGalleryUrl({
          page:
            fallbackNextPage,

          limit,

          label:
            selectedLabel,
        })
      : "#";

  const reloadUrl =
    buildGalleryUrl({
      cursor:
        "",

      limit,

      label:
        selectedLabel,
    });

  /*
  |--------------------------------------------------------------------------
  | Progress
  |--------------------------------------------------------------------------
  */

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
                cursor:
                  "",

                limit,

                label:
                  value,
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
  | Kartu Gambar
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
                      #${index + 1}
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
                      action="/api/update-label"
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
                        name="cursor"
                        value="${escapeHtml(
                          currentCursor
                        )}"
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
                          Perubahan langsung
                          disimpan ke Cloudinary.
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
            atau muat ulang data
            dari Cloudinary.
          </p>

          <a
            class="btn btn-primary"
            href="${buildGalleryUrl({
              cursor:
                "",

              limit,

              label:
                "all",
            })}"
          >
            Tampilkan semua data
          </a>
        </div>
      `;

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
        savedTheme ===
          "dark" ||
        savedTheme ===
          "light"
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

    .sidebar-footer strong,
    .sidebar-footer span {
      display:
        block;
    }

    .sidebar-footer strong {
      margin-bottom:
        5px;

      font-size:
        12px;
    }

    .sidebar-footer span {
      overflow:
        hidden;

      color:
        rgba(
          255,
          255,
          255,
          0.58
        );

      font-size:
        11px;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;
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
        28px;
    }

    .main-inner {
      width:
        min(
          1480px,
          100%
        );

      margin:
        0 auto;
    }

    .topbar {
      display:
        flex;

      align-items:
        flex-start;

      justify-content:
        space-between;

      gap:
        20px;

      margin-bottom:
        22px;
    }

    .eyebrow {
      margin:
        0 0 7px;

      color:
        var(--accent);

      font-size:
        12px;

      font-weight:
        800;

      letter-spacing:
        0.12em;

      text-transform:
        uppercase;
    }

    h1 {
      margin:
        0;

      color:
        var(--text-strong);

      font-size:
        clamp(
          27px,
          3vw,
          40px
        );

      line-height:
        1.08;

      letter-spacing:
        -0.04em;
    }

    .topbar-copy
    p:last-child {
      max-width:
        720px;

      margin:
        10px 0 0;

      color:
        var(--muted);

      font-size:
        14px;

      line-height:
        1.7;
    }

    .top-actions {
      display:
        flex;

      flex-wrap:
        wrap;

      justify-content:
        flex-end;

      gap:
        9px;
    }

    /*
    |--------------------------------------------------------------------------
    | Buttons
    |--------------------------------------------------------------------------
    */

    .btn,
    .theme-toggle,
    .page-nav,
    .save-one-btn,
    .bulk-btn {
      border:
        0;

      cursor:
        pointer;

      text-decoration:
        none;

      transition:
        transform 0.18s ease,
        background 0.18s ease,
        border-color 0.18s ease,
        color 0.18s ease,
        opacity 0.18s ease;
    }

    .btn {
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
        var(--line);

      border-radius:
        13px;

      color:
        var(--text);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-sm);

      font-size:
        13px;

      font-weight:
        750;
    }

    .btn:hover,
    .theme-toggle:hover,
    .page-nav:hover:not(
      .disabled
    ) {
      transform:
        translateY(
          -1px
        );
    }

    .btn-primary {
      color:
        var(--primary-text);

      background:
        var(--primary);

      border-color:
        var(--primary);
    }

    .btn-primary:hover {
      background:
        var(--primary-hover);
    }

    .theme-toggle {
      width:
        42px;

      height:
        42px;

      position:
        relative;

      display:
        grid;

      place-items:
        center;

      border:
        1px solid
        var(--line);

      border-radius:
        13px;

      color:
        var(--text);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-sm);
    }

    .theme-icon {
      width:
        19px;

      height:
        19px;

      position:
        absolute;

      transition:
        opacity 0.18s ease,
        transform 0.18s ease;
    }

    .theme-icon-light {
      opacity:
        0;

      transform:
        rotate(
          -22deg
        )
        scale(
          0.75
        );
    }

    html[data-theme="dark"]
    .theme-icon-dark {
      opacity:
        0;

      transform:
        rotate(
          22deg
        )
        scale(
          0.75
        );
    }

    html[data-theme="dark"]
    .theme-icon-light {
      opacity:
        1;

      transform:
        rotate(
          0
        )
        scale(
          1
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Alert
    |--------------------------------------------------------------------------
    */

    .page-alert {
      margin-bottom:
        18px;

      padding:
        13px 15px;

      display:
        flex;

      align-items:
        center;

      gap:
        10px;

      border:
        1px solid
        var(--line);

      border-radius:
        var(--radius-md);

      background:
        var(--surface);

      font-size:
        13px;

      font-weight:
        650;
    }

    .page-alert-success {
      color:
        var(--accent);

      background:
        var(--accent-soft);
    }

    .page-alert-error {
      color:
        var(--danger);

      background:
        var(--danger-soft);
    }

    .page-alert-icon
    .icon {
      width:
        18px;

      height:
        18px;
    }

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    .summary-grid {
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
        13px;

      margin-bottom:
        18px;
    }

    .summary-card {
      padding:
        17px;

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

    .summary-head {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        10px;

      margin-bottom:
        13px;
    }

    .summary-head span {
      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        750;
    }

    .summary-head strong {
      color:
        var(--text-strong);

      font-size:
        21px;

      letter-spacing:
        -0.03em;
    }

    .progress-track {
      height:
        7px;

      overflow:
        hidden;

      border-radius:
        999px;

      background:
        var(--surface-muted);
    }

    .progress-bar {
      height:
        100%;

      border-radius:
        inherit;

      background:
        var(--accent);
    }

    .summary-foot {
      margin-top:
        9px;

      display:
        flex;

      justify-content:
        space-between;

      color:
        var(--muted-2);

      font-size:
        11px;

      font-weight:
        700;
    }

    /*
    |--------------------------------------------------------------------------
    | Toolbar
    |--------------------------------------------------------------------------
    */

    .toolbar {
      margin-bottom:
        18px;

      padding:
        15px;

      display:
        grid;

      grid-template-columns:
        minmax(
          240px,
          1fr
        )
        auto;

      align-items:
        center;

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

    .search-wrap {
      position:
        relative;
    }

    .search-wrap
    > .icon {
      position:
        absolute;

      top:
        50%;

      left:
        14px;

      width:
        18px;

      height:
        18px;

      color:
        var(--muted-2);

      transform:
        translateY(
          -50%
        );

      pointer-events:
        none;
    }

    .search-input {
      width:
        100%;

      min-height:
        44px;

      padding:
        0 86px
        0 43px;

      border:
        1px solid
        var(--line);

      border-radius:
        13px;

      outline:
        none;

      color:
        var(--text);

      background:
        var(--surface-soft);
    }

    .search-input:focus {
      border-color:
        var(--accent);

      box-shadow:
        0 0 0 3px
        var(--accent-soft);
    }

    .clear-search {
      position:
        absolute;

      top:
        50%;

      right:
        8px;

      min-height:
        30px;

      padding:
        0 9px;

      border:
        0;

      border-radius:
        9px;

      color:
        var(--muted);

      background:
        transparent;

      cursor:
        pointer;

      transform:
        translateY(
          -50%
        );

      font-size:
        11px;

      font-weight:
        750;
    }

    .filter-list {
      display:
        flex;

      flex-wrap:
        wrap;

      justify-content:
        flex-end;

      gap:
        8px;
    }

    .filter-chip {
      min-height:
        38px;

      padding:
        0 12px;

      display:
        inline-flex;

      align-items:
        center;

      gap:
        8px;

      border:
        1px solid
        var(--line);

      border-radius:
        12px;

      text-decoration:
        none;

      color:
        var(--muted);

      background:
        var(--surface-soft);

      font-size:
        12px;

      font-weight:
        750;
    }

    .filter-chip strong {
      min-width:
        24px;

      padding:
        3px 7px;

      border-radius:
        999px;

      text-align:
        center;

      color:
        var(--text);

      background:
        var(--surface-muted);

      font-size:
        10px;
    }

    .filter-chip.active {
      color:
        var(--primary-text);

      background:
        var(--primary);

      border-color:
        var(--primary);
    }

    .filter-chip.active
    strong {
      color:
        var(--primary-text);

      background:
        rgba(
          255,
          255,
          255,
          0.16
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Bulk
    |--------------------------------------------------------------------------
    */

    .bulk-panel {
      margin-bottom:
        14px;

      padding:
        12px 14px;

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
        var(--radius-md);

      background:
        var(--surface);
    }

    .bulk-left,
    .bulk-actions {
      display:
        flex;

      align-items:
        center;

      flex-wrap:
        wrap;

      gap:
        9px;
    }

    .selection-control {
      display:
        inline-flex;

      align-items:
        center;

      gap:
        8px;

      color:
        var(--muted);

      cursor:
        pointer;

      font-size:
        12px;

      font-weight:
        750;
    }

    .selection-control
    input {
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
        1px solid
        var(--line-strong);

      border-radius:
        6px;

      color:
        transparent;

      background:
        var(--surface);
    }

    .selection-icon {
      width:
        13px;

      height:
        13px;
    }

    .selection-control
    input:checked
    + .selection-box {
      color:
        var(--primary-text);

      background:
        var(--primary);

      border-color:
        var(--primary);
    }

    .selected-count {
      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        700;
    }

    .bulk-btn {
      min-height:
        36px;

      padding:
        0 11px;

      border:
        1px solid
        var(--line);

      border-radius:
        11px;

      color:
        var(--text);

      background:
        var(--surface-soft);

      font-size:
        12px;

      font-weight:
        750;
    }

    .bulk-btn:disabled {
      cursor:
        not-allowed;

      opacity:
        0.48;
    }

    .bulk-btn-primary {
      color:
        var(--primary-text);

      background:
        var(--primary);

      border-color:
        var(--primary);
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
        800;

      box-shadow:
        0 6px 18px
        rgba(
          15,
          23,
          42,
          0.18
        );
    }

    .badge-medical {
      color:
        #991b1b;

      background:
        #fee2e2;
    }

    .badge-nonmedical {
      color:
        #166534;

      background:
        #dcfce7;
    }

    .badge-unknown {
      color:
        #92400e;

      background:
        #fef3c7;
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
      display:
        block;

      margin-bottom:
        5px;

      color:
        var(--accent);

      font-size:
        10px;

      font-weight:
        800;

      letter-spacing:
        0.08em;

      text-transform:
        uppercase;
    }

    .card-heading h3 {
      margin:
        0;

      overflow:
        hidden;

      color:
        var(--text-strong);

      font-size:
        13px;

      line-height:
        1.4;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;
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
    }

    .icon-link
    .icon {
      width:
        17px;

      height:
        17px;
    }

    .metadata-row {
      margin:
        12px 0;

      padding:
        9px 0;

      display:
        flex;

      flex-wrap:
        wrap;

      gap:
        7px;

      border-top:
        1px solid
        var(--line);

      border-bottom:
        1px solid
        var(--line);
    }

    .metadata-row span {
      padding:
        4px 7px;

      border-radius:
        8px;

      color:
        var(--muted);

      background:
        var(--surface-soft);

      font-size:
        10px;

      font-weight:
        750;
    }

    /*
    |--------------------------------------------------------------------------
    | Single Label
    |--------------------------------------------------------------------------
    */

    .single-label-form {
      display:
        grid;

      gap:
        9px;
    }

    .single-label-copy {
      display:
        flex;

      align-items:
        flex-end;

      justify-content:
        space-between;

      gap:
        10px;
    }

    .single-label-copy
    label {
      color:
        var(--text-strong);

      font-size:
        11px;

      font-weight:
        800;
    }

    .single-label-copy
    small {
      color:
        var(--muted-2);

      font-size:
        9px;

      text-align:
        right;
    }

    .single-label-controls {
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
    select {
      min-width:
        0;

      min-height:
        38px;

      padding:
        0 10px;

      border:
        1px solid
        var(--line);

      border-radius:
        10px;

      outline:
        none;

      color:
        var(--text);

      background:
        var(--surface-soft);

      font-size:
        11px;

      font-weight:
        700;
    }

    .save-one-btn {
      min-height:
        38px;

      padding:
        0 12px;

      border-radius:
        10px;

      color:
        var(--primary-text);

      background:
        var(--primary);

      font-size:
        11px;

      font-weight:
        800;
    }

    .save-one-btn:disabled {
      cursor:
        wait;

      opacity:
        0.65;
    }

    /*
    |--------------------------------------------------------------------------
    | Empty
    |--------------------------------------------------------------------------
    */

    .empty-state {
      grid-column:
        1 / -1;

      min-height:
        330px;

      padding:
        34px;

      display:
        grid;

      place-items:
        center;

      align-content:
        center;

      text-align:
        center;

      border:
        1px dashed
        var(--line-strong);

      border-radius:
        var(--radius-xl);

      background:
        var(--surface);
    }

    .empty-icon {
      width:
        58px;

      height:
        58px;

      display:
        grid;

      place-items:
        center;

      margin-bottom:
        12px;

      border-radius:
        18px;

      color:
        var(--accent);

      background:
        var(--accent-soft);
    }

    .empty-state h2 {
      margin:
        0;

      color:
        var(--text-strong);

      font-size:
        19px;
    }

    .empty-state p {
      max-width:
        420px;

      margin:
        9px 0 18px;

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
        14px;

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
        8px;

      color:
        var(--muted);

      font-size:
        12px;

      font-weight:
        750;
    }

    .limit-select {
      min-height:
        36px;

      padding:
        0 30px
        0 10px;

      border:
        1px solid
        var(--line);

      border-radius:
        10px;

      color:
        var(--text);

      background:
        var(--surface-soft);

      cursor:
        pointer;

      font-size:
        12px;

      font-weight:
        750;
    }

    .pagination-links {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;
    }

    .page-nav {
      min-height:
        38px;

      padding:
        0 13px;

      display:
        inline-flex;

      align-items:
        center;

      gap:
        8px;

      border:
        1px solid
        var(--line);

      border-radius:
        11px;

      color:
        var(--text);

      background:
        var(--surface-soft);

      font-size:
        12px;

      font-weight:
        800;
    }

    .page-nav.disabled {
      cursor:
        not-allowed;

      opacity:
        0.45;

      pointer-events:
        none;
    }

    /*
    |--------------------------------------------------------------------------
    | Toast
    |--------------------------------------------------------------------------
    */

    .toast-container {
      position:
        fixed;

      top:
        18px;

      right:
        18px;

      z-index:
        1200;

      width:
        min(
          380px,
          calc(
            100vw - 36px
          )
        );

      display:
        grid;

      gap:
        10px;
    }

    .toast {
      padding:
        14px;

      border:
        1px solid
        var(--line);

      border-radius:
        14px;

      color:
        var(--text);

      background:
        var(--surface);

      box-shadow:
        var(--shadow-md);

      animation:
        toast-in 0.2s
        ease;
    }

    .toast strong,
    .toast span {
      display:
        block;
    }

    .toast strong {
      margin-bottom:
        4px;

      color:
        var(--text-strong);

      font-size:
        13px;
    }

    .toast span {
      color:
        var(--muted);

      font-size:
        12px;

      line-height:
        1.5;
    }

    .toast-success {
      border-color:
        var(--accent);
    }

    .toast-error {
      border-color:
        var(--danger);
    }

    .toast-warning {
      border-color:
        var(--warning);
    }

    /*
    |--------------------------------------------------------------------------
    | Processing
    |--------------------------------------------------------------------------
    */

    .processing-overlay {
      position:
        fixed;

      inset:
        0;

      z-index:
        1100;

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
          0.52
        );

      backdrop-filter:
        blur(
          4px
        );
    }

    .processing-overlay.active {
      display:
        grid;
    }

    .processing-card {
      width:
        min(
          390px,
          100%
        );

      padding:
        23px;

      border:
        1px solid
        var(--line);

      border-radius:
        20px;

      text-align:
        center;

      background:
        var(--surface);

      box-shadow:
        var(--shadow-md);
    }

    .spinner {
      width:
        38px;

      height:
        38px;

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
      margin-bottom:
        6px;

      color:
        var(--text-strong);

      font-size:
        15px;
    }

    .processing-card span {
      color:
        var(--muted);

      font-size:
        12px;

      line-height:
        1.55;
    }

    @keyframes spin {
      to {
        transform:
          rotate(
            360deg
          );
      }
    }

    @keyframes toast-in {
      from {
        opacity:
          0;

        transform:
          translateY(
            -8px
          );
      }

      to {
        opacity:
          1;

        transform:
          translateY(
            0
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
      .summary-grid {
        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );
      }

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

      .toolbar {
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
      820px
    ) {
      .app {
        display:
          block;
      }

      .sidebar {
        position:
          relative;

        height:
          auto;

        padding:
          16px;
      }

      .brand {
        margin-bottom:
          14px;
      }

      .nav {
        display:
          flex;

        overflow-x:
          auto;

        padding-bottom:
          4px;
      }

      .nav a {
        flex:
          0 0 auto;
      }

      .sidebar-footer {
        display:
          none;
      }

      .main {
        padding:
          20px 16px
          30px;
      }

      .topbar {
        display:
          grid;
      }

      .top-actions {
        justify-content:
          flex-start;
      }

      .bulk-panel,
      .pagination-panel {
        align-items:
          stretch;

        flex-direction:
          column;
      }

      .pagination-links,
      .page-nav {
        width:
          100%;
      }

      .page-nav {
        justify-content:
          center;
      }
    }

    @media (
      max-width:
      620px
    ) {
      .summary-grid,
      .gallery-grid {
        grid-template-columns:
          1fr;
      }

      .top-actions
      .btn {
        flex:
          1 1 140px;
      }

      .toolbar {
        padding:
          12px;
      }

      .filter-list {
        display:
          grid;

        grid-template-columns:
          repeat(
            2,
            minmax(
              0,
              1fr
            )
          );
      }

      .filter-chip {
        justify-content:
          space-between;
      }

      .bulk-actions {
        width:
          100%;
      }

      .bulk-btn {
        flex:
          1 1 140px;
      }

      .single-label-copy {
        align-items:
          flex-start;

        flex-direction:
          column;
      }

      .single-label-copy
      small {
        text-align:
          left;
      }
    }
  </style>
</head>

<body>
  <div
    class="app"
  >
    <aside
      class="sidebar"
    >
      <div
        class="brand"
      >
        <div
          class="brand-mark"
        >
          ${brandCameraIcon()}
        </div>

        <div>
          <div
            class="brand-title"
          >
            Capture Panel
          </div>

          <div
            class="brand-subtitle"
          >
            ESP32-CAM Dataset
          </div>
        </div>
      </div>

      <nav
        class="nav"
        aria-label="Navigasi utama"
      >
        <a
          href="/"
        >
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

        <a
          href="/summary"
        >
          ${icon("chart")}
          Summary
        </a>

        <a
          href="/test-upload"
        >
          ${icon("upload")}
          Upload
        </a>

        <a
          href="/docs"
        >
          ${icon("file")}
          Docs
        </a>

        <a
          href="/status"
        >
          ${icon("settings")}
          Settings
        </a>
      </nav>

      <div
        class="sidebar-footer"
      >
        <strong>
          Cloudinary Folder
        </strong>

        <span
          title="${escapeHtml(
            CLOUDINARY_FOLDER
          )}"
        >
          ${escapeHtml(
            CLOUDINARY_FOLDER
          )}
        </span>
      </div>
    </aside>

    <main
      class="main"
    >
      <div
        class="main-inner"
      >
        <header
          class="topbar"
        >
          <div
            class="topbar-copy"
          >
            <p
              class="eyebrow"
            >
              Dataset Management
            </p>

            <h1>
              Galeri Dataset Limbah
            </h1>

            <p>
              Menampilkan
              ${pageUploads.length}
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

          <div
            class="top-actions"
          >
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

            <a
              class="btn"
              href="${reloadUrl}"
            >
              ${icon("refresh")}
              Muat ulang
            </a>

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

        <section
          class="summary-grid"
          aria-label="Ringkasan dataset"
        >
          <article
            class="summary-card"
          >
            <div
              class="summary-head"
            >
              <span>
                Total dataset
              </span>

              <strong>
                ${total}
              </strong>
            </div>

            <div
              class="progress-track"
            >
              <div
                class="progress-bar"
                style="width: ${totalProgress}%"
              ></div>
            </div>

            <div
              class="summary-foot"
            >
              <span>
                Target
                ${DATASET_TARGET}
              </span>

              <span>
                ${totalProgress}%
              </span>
            </div>
          </article>

          <article
            class="summary-card"
          >
            <div
              class="summary-head"
            >
              <span>
                Medis
              </span>

              <strong>
                ${medis}
              </strong>
            </div>

            <div
              class="progress-track"
            >
              <div
                class="progress-bar"
                style="width: ${medisProgress}%"
              ></div>
            </div>

            <div
              class="summary-foot"
            >
              <span>
                Target
                ${CLASS_TARGET}
              </span>

              <span>
                ${medisProgress}%
              </span>
            </div>
          </article>

          <article
            class="summary-card"
          >
            <div
              class="summary-head"
            >
              <span>
                Non-medis
              </span>

              <strong>
                ${nonMedis}
              </strong>
            </div>

            <div
              class="progress-track"
            >
              <div
                class="progress-bar"
                style="width: ${nonMedisProgress}%"
              ></div>
            </div>

            <div
              class="summary-foot"
            >
              <span>
                Target
                ${CLASS_TARGET}
              </span>

              <span>
                ${nonMedisProgress}%
              </span>
            </div>
          </article>

          <article
            class="summary-card"
          >
            <div
              class="summary-head"
            >
              <span>
                Unknown
              </span>

              <strong>
                ${unknown}
              </strong>
            </div>

            <div
              class="progress-track"
            >
              <div
                class="progress-bar"
                style="width: ${unknownProgress}%"
              ></div>
            </div>

            <div
              class="summary-foot"
            >
              <span>
                Perlu koreksi
              </span>

              <span>
                ${unknownProgress}%
              </span>
            </div>
          </article>
        </section>

        <section
          class="toolbar"
        >
          <div
            class="search-wrap"
          >
            ${icon("search")}

            <input
              class="search-input"
              id="gallerySearch"
              type="search"
              placeholder="Cari public ID atau sumber..."
              autocomplete="off"
            />

            <button
              class="clear-search"
              id="clearSearch"
              type="button"
            >
              Hapus
            </button>
          </div>

          <div
            class="filter-list"
            aria-label="Filter kelas"
          >
            ${filterLinks}
          </div>
        </section>

        <section
          class="bulk-panel"
        >
          <div
            class="bulk-left"
          >
            <label
              class="selection-control"
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

          <div
            class="bulk-actions"
          >
            <button
              class="bulk-btn bulk-btn-primary"
              type="button"
              data-label="medis"
              disabled
            >
              Tandai Medis
            </button>

            <button
              class="bulk-btn"
              type="button"
              data-label="non_medis"
              disabled
            >
              Tandai Non-medis
            </button>
          </div>
        </section>

        <div
          class="gallery-meta"
        >
          <span
            id="visibleResult"
          >
            ${pageUploads.length}
            kartu dimuat
          </span>

          <span>
            Total filter:
            ${totalItems}
            data
          </span>
        </div>

        <section
          class="gallery-grid"
          id="galleryGrid"
          aria-live="polite"
        >
          ${cards}
        </section>

        <section
          class="pagination-panel"
        >
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

            data per permintaan
          </label>

          <div
            class="pagination-links"
          >
            <a
              class="page-nav ${
                hasMore
                  ? ""
                  : "disabled"
              }"
              href="${nextUrl}"
              ${
                hasMore
                  ? ""
                  : 'aria-disabled="true" tabindex="-1"'
              }
            >
              <span>
                Berikutnya
              </span>

              ${icon(
                "chevronRight"
              )}
            </a>
          </div>
        </section>
      </div>
    </main>
  </div>

  <div
    class="toast-container"
    id="toastContainer"
    aria-live="polite"
    aria-atomic="true"
  ></div>

  <div
    class="processing-overlay"
    id="processingOverlay"
    aria-hidden="true"
  >
    <div
      class="processing-card"
      role="status"
    >
      <div
        class="spinner"
      ></div>

      <strong
        id="processingTitle"
      >
        Memproses data
      </strong>

      <span
        id="processingMessage"
      >
        Metadata Cloudinary
        sedang diperbarui.
      </span>
    </div>
  </div>

  <script>
    /*
    |--------------------------------------------------------------------------
    | Element
    |--------------------------------------------------------------------------
    */

    const THEME_KEY =
      "capture-panel-gallery-theme";

    const themeToggle =
      document.getElementById(
        "themeToggle"
      );

    const searchInput =
      document.getElementById(
        "gallerySearch"
      );

    const clearSearch =
      document.getElementById(
        "clearSearch"
      );

    const galleryGrid =
      document.getElementById(
        "galleryGrid"
      );

    const visibleResult =
      document.getElementById(
        "visibleResult"
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

    /*
    |--------------------------------------------------------------------------
    | Theme
    |--------------------------------------------------------------------------
    */

    function getCurrentTheme() {
      return document
        .documentElement
        .getAttribute(
          "data-theme"
        ) === "dark"
        ? "dark"
        : "light";
    }

    function updateThemeToggle() {
      const dark =
        getCurrentTheme() ===
        "dark";

      themeToggle
        ?.setAttribute(
          "aria-pressed",
          String(dark)
        );

      themeToggle
        ?.setAttribute(
          "aria-label",

          dark
            ? "Aktifkan mode terang"
            : "Aktifkan mode gelap"
        );

      themeToggle
        ?.setAttribute(
          "title",

          dark
            ? "Aktifkan mode terang"
            : "Aktifkan mode gelap"
        );
    }

    themeToggle
      ?.addEventListener(
        "click",

        function () {
          const nextTheme =
            getCurrentTheme() ===
            "dark"
              ? "light"
              : "dark";

          document
            .documentElement
            .setAttribute(
              "data-theme",
              nextTheme
            );

          document
            .documentElement
            .style
            .colorScheme =
            nextTheme;

          try {
            localStorage.setItem(
              THEME_KEY,
              nextTheme
            );
          } catch (error) {
            /*
             * Penyimpanan tema
             * tidak bersifat wajib.
             */
          }

          updateThemeToggle();
        }
      );

    updateThemeToggle();

    /*
    |--------------------------------------------------------------------------
    | Helper Selection
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
            return !card
              .classList
              .contains(
                "search-hidden"
              );
          }
        );
    }

    function getSelectedCheckboxes() {
      return Array.from(
        document
          .querySelectorAll(
            ".select-image:checked"
          )
      );
    }

    function updateSelectionState() {
      const selected =
        getSelectedCheckboxes();

      const visibleCheckboxes =
        getVisibleCards()
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
                  checkbox
                    ?.checked
                )
              );
          }
        );

      if (selectedCount) {
        selectedCount
          .textContent =
          selected.length +
          " gambar dipilih";
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
              selected.length ===
              0;
          }
        );

      if (selectAll) {
        const selectedVisible =
          visibleCheckboxes
            .filter(
              function (
                checkbox
              ) {
                return checkbox
                  .checked;
              }
            )
            .length;

        selectAll.checked =
          visibleCheckboxes.length >
            0 &&
          selectedVisible ===
            visibleCheckboxes.length;

        selectAll.indeterminate =
          selectedVisible > 0 &&
          selectedVisible <
            visibleCheckboxes.length;
      }
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
            ?.value ||
            ""
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
            const haystack =
              [
                card.dataset
                  .publicId ||
                  "",

                card.dataset
                  .source ||
                  "",

                card.dataset
                  .label ||
                  "",
              ].join(" ");

            const visible =
              !query ||
              haystack.includes(
                query
              );

            card
              .classList
              .toggle(
                "search-hidden",
                !visible
              );

            if (visible) {
              visibleCount +=
                1;
            }
          }
        );

      if (visibleResult) {
        visibleResult
          .textContent =
          visibleCount +
          " kartu terlihat" +
          (
            query
              ? " setelah pencarian"
              : ""
          );
      }

      updateSelectionState();
    }

    searchInput
      ?.addEventListener(
        "input",
        applySearch
      );

    clearSearch
      ?.addEventListener(
        "click",

        function () {
          if (searchInput) {
            searchInput.value =
              "";

            searchInput.focus();
          }

          applySearch();
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Checkbox
    |--------------------------------------------------------------------------
    */

    selectAll
      ?.addEventListener(
        "change",

        function () {
          getVisibleCards()
            .forEach(
              function (
                card
              ) {
                const checkbox =
                  card
                    .querySelector(
                      ".select-image"
                    );

                if (checkbox) {
                  checkbox.checked =
                    selectAll
                      .checked;
                }
              }
            );

          updateSelectionState();
        }
      );

    galleryGrid
      ?.addEventListener(
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
    | Limit
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

          /*
           * Perubahan jumlah data
           * kembali ke kumpulan awal.
           */

          query.delete(
            "cursor"
          );

          query.delete(
            "page"
          );

          query.set(
            "limit",
            limitSelect.value
          );

          query.set(
            "label",
            "${escapeHtml(
              selectedLabel
            )}"
          );

          window.location.href =
            "/gallery?" +
            query.toString();
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Toast
    |--------------------------------------------------------------------------
    */

    function showToast(
      title,
      message,
      type
    ) {
      const container =
        document
          .getElementById(
            "toastContainer"
          );

      if (!container) {
        return;
      }

      const toast =
        document
          .createElement(
            "div"
          );

      toast.className =
        "toast toast-" +
        (
          type ||
          "success"
        );

      const strong =
        document
          .createElement(
            "strong"
          );

      const span =
        document
          .createElement(
            "span"
          );

      strong.textContent =
        title;

      span.textContent =
        message;

      toast.appendChild(
        strong
      );

      toast.appendChild(
        span
      );

      container.appendChild(
        toast
      );

      window.setTimeout(
        function () {
          toast.remove();
        },

        4200
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Processing Overlay
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

      processingOverlay
        ?.classList
        .add(
          "active"
        );

      processingOverlay
        ?.setAttribute(
          "aria-hidden",
          "false"
        );
    }

    function hideProcessing() {
      processingOverlay
        ?.classList
        .remove(
          "active"
        );

      processingOverlay
        ?.setAttribute(
          "aria-hidden",
          "true"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Parse JSON
    |--------------------------------------------------------------------------
    */

    async function parseJsonResponse(
      response
    ) {
      const responseText =
        await response
          .text();

      if (!responseText) {
        return {};
      }

      try {
        return JSON.parse(
          responseText
        );
      } catch (error) {
        throw new Error(
          "Respons backend bukan JSON. Status HTTP " +
          response.status +
          "."
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Single Label
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

            async function (
              event
            ) {
              event.preventDefault();

              const button =
                form.querySelector(
                  ".save-one-btn"
                );

              const formData =
                new FormData(
                  form
                );

              const publicId =
                String(
                  formData.get(
                    "public_id"
                  ) || ""
                ).trim();

              const label =
                String(
                  formData.get(
                    "label"
                  ) || ""
                ).trim();

              if (
                !publicId ||
                !label
              ) {
                showToast(
                  "Data belum lengkap",

                  "Public ID dan label wajib diisi.",

                  "error"
                );

                return;
              }

              if (button) {
                button.disabled =
                  true;

                button.textContent =
                  "Menyimpan...";
              }

              showProcessing(
                "Memperbarui label",

                "Metadata Cloudinary sedang diperbarui."
              );

              const controller =
                new AbortController();

              const timeoutId =
                window
                  .setTimeout(
                    function () {
                      controller
                        .abort();
                    },

                    30000
                  );

              try {
                const response =
                  await fetch(
                    "/api/update-label",

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
                        controller
                          .signal,

                      body:
                        JSON.stringify({
                          public_id:
                            publicId,

                          label,
                        }),
                    }
                  );

                const result =
                  await parseJsonResponse(
                    response
                  );

                if (
                  !response.ok ||
                  result.success !==
                    true
                ) {
                  throw new Error(
                    result.message ||
                    "Label gagal diperbarui."
                  );
                }

                hideProcessing();

                showToast(
                  "Label diperbarui",

                  result.message ||
                  "Label berhasil diperbarui di Cloudinary.",

                  "success"
                );

                window
                  .setTimeout(
                    function () {
                      window
                        .location
                        .reload();
                    },

                    700
                  );
              } catch (
                error
              ) {
                hideProcessing();

                if (button) {
                  button.disabled =
                    false;

                  button.textContent =
                    "Simpan";
                }

                const message =
                  error.name ===
                  "AbortError"
                    ? "Proses pembaruan melewati batas waktu."
                    : error.message ||
                      "Label gagal diperbarui.";

                showToast(
                  "Pembaruan gagal",

                  message,

                  "error"
                );
              } finally {
                window
                  .clearTimeout(
                    timeoutId
                  );
              }
            }
          );
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Bulk Label
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
              const publicIds =
                getSelectedCheckboxes()
                  .map(
                    function (
                      checkbox
                    ) {
                      return checkbox
                        .value;
                    }
                  )
                  .filter(
                    Boolean
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

              if (
                publicIds.length >
                100
              ) {
                showToast(
                  "Pilihan terlalu banyak",

                  "Maksimal 100 gambar dalam satu bulk update.",

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

                "Metadata Cloudinary sedang diperbarui."
              );

              const controller =
                new AbortController();

              const timeoutId =
                window
                  .setTimeout(
                    function () {
                      controller
                        .abort();
                    },

                    45000
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
                        controller
                          .signal,

                      body:
                        JSON.stringify({
                          public_ids:
                            publicIds,

                          label:
                            newLabel,
                        }),
                    }
                  );

                const result =
                  await parseJsonResponse(
                    response
                  );

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

                window
                  .setTimeout(
                    function () {
                      window
                        .location
                        .reload();
                    },

                    800
                  );
              } catch (
                error
              ) {
                hideProcessing();

                const message =
                  error.name ===
                  "AbortError"
                    ? "Proses pembaruan melewati batas waktu."
                    : error.message ||
                      "Bulk update label gagal.";

                showToast(
                  "Bulk update gagal",

                  message,

                  "error"
                );

                updateSelectionState();
              } finally {
                window
                  .clearTimeout(
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