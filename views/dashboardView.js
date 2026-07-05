const formatBytes = require("../utils/formatBytes");

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatLabel(label = "") {
  const labels = {
    medis: "Medis",
    non_medis: "Non-medis",
    unknown: "Unknown",
  };

  return labels[label] || label || "Unknown";
}

function calculateProgress(current, target) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((current / target) * 100)
  );
}

/*
|--------------------------------------------------------------------------
| Icon
|--------------------------------------------------------------------------
*/

function iconCamera() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
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
    </svg>
  `;
}

function iconGrid() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
    </svg>
  `;
}

function iconUpload() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M12 15V4"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="m7.5 8.5 4.5-4.5 4.5 4.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9A2.5 2.5 0 0 0 19 17.5V15"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function iconChart() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M5 19V5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M8.5 16v-4M12 16V8M15.5 16v-6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function iconDocs() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M14 3.5V8h4.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path
        d="M9 13h6M9 16h6M9 10h2"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function iconSettings() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
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
    </svg>
  `;
}

function iconCheck() {
  return `
    <svg viewBox="0 0 24 24" class="mini-icon" fill="none" aria-hidden="true">
      <path
        d="m6.5 12.5 3.2 3.2 7.8-8.2"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function iconArrow() {
  return `
    <svg viewBox="0 0 24 24" class="mini-icon" fill="none" aria-hidden="true">
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function iconStorage() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M5 7c0-1.66 3.13-3 7-3s7 1.34 7 3-3.13 3-7 3-7-1.34-7-3Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M5 7v5c0 1.66 3.13 3 7 3s7-1.34 7-3V7"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M5 12v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5"
        stroke="currentColor"
        stroke-width="1.8"
      />
    </svg>
  `;
}

function iconTarget() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
        fill="currentColor"
      />
    </svg>
  `;
}

function iconRefresh() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path
        d="M20 7v5h-5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19 12a7 7 0 1 0-2.05 4.95"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function iconMoon() {
  return `
    <svg class="theme-icon theme-icon-dark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg class="theme-icon theme-icon-light" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
| Dashboard
|--------------------------------------------------------------------------
*/

function dashboardView({
  uploads = [],
  summary = {},
  config = {},
}) {
  const DATASET_TARGET = 3000;
  const MEDICAL_TARGET = 1500;
  const NON_MEDICAL_TARGET = 1500;

  const total = Number(summary.total) || 0;
  const medis = Number(summary.medis) || 0;
  const nonMedis = Number(summary.non_medis) || 0;
  const unknown = Number(summary.unknown) || 0;
  const totalBytes = Number(summary.total_bytes) || 0;

  /*
   * Persentase komposisi data aktual.
   * Ini berbeda dari progress terhadap target.
   */
  const medisComposition =
    total > 0
      ? Math.round((medis / total) * 100)
      : 0;

  const nonMedisComposition =
    total > 0
      ? Math.round((nonMedis / total) * 100)
      : 0;

  const unknownComposition =
    total > 0
      ? Math.round((unknown / total) * 100)
      : 0;

  /*
   * Progress target dataset.
   */
  const totalProgress = calculateProgress(
    total,
    DATASET_TARGET
  );

  const medicalProgress = calculateProgress(
    medis,
    MEDICAL_TARGET
  );

  const nonMedicalProgress = calculateProgress(
    nonMedis,
    NON_MEDICAL_TARGET
  );

  /*
   * Kekurangan data.
   */
  const remainingTotal = Math.max(
    0,
    DATASET_TARGET - total
  );

  const remainingMedical = Math.max(
    0,
    MEDICAL_TARGET - medis
  );

  const remainingNonMedical = Math.max(
    0,
    NON_MEDICAL_TARGET - nonMedis
  );

  const latestUpload = uploads[0] || null;

  const averageFileSize =
    total > 0
      ? totalBytes / total
      : 0;

  /*
   * Informasi sinkronisasi Cloudinary.
   */
  const syncReady =
    config.syncReady === true;

  const syncMessage =
    config.syncMessage ||
    "Belum ada informasi sinkronisasi.";

  const lastSyncedAt =
    config.lastSyncedAt
      ? formatDateTime(config.lastSyncedAt)
      : "-";

  const recentRows =
    uploads.length > 0
      ? uploads
          .slice(0,15)
          .map((item) => {
            const imageUrl = escapeHtml(
              item.secure_url || ""
            );

            const publicId = escapeHtml(
              item.public_id || "-"
            );

            const source = escapeHtml(
              item.source || "esp32cam"
            );

            const label = item.label || "unknown";

            const labelClass =
              label === "non_medis"
                ? "label-blue"
                : label === "unknown"
                ? "label-gray"
                : "";

            return `
              <tr>
                <td>
                  <div class="capture-cell">
                    <a
                      class="capture-thumb"
                      href="${imageUrl}"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src="${imageUrl}"
                        alt="Capture preview"
                      />
                    </a>

                    <div class="capture-info">
                      <div class="capture-name">
                        ${publicId}
                      </div>

                      <div class="capture-meta">
                        ${source}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="label ${labelClass}">
                    ${escapeHtml(formatLabel(label))}
                  </span>
                </td>

                <td>
                  ${item.width || "-"}
                  ×
                  ${item.height || "-"}
                </td>

                <td>
                  ${formatBytes(item.bytes || 0)}
                </td>

                <td>
                  <a
                    class="row-link"
                    href="${imageUrl}"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka ${iconArrow()}
                  </a>
                </td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="5">
            <div class="empty-table">
              Belum ada citra yang tersimpan.
            </div>
          </td>
        </tr>
      `;

  return `
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Dataset Capture Panel</title>
  <link
    rel="icon"
    type="image/svg+xml"
    href="/favicon.svg"
  />

  <script>
    (function () {
      const savedTheme =
        localStorage.getItem("capture-panel-theme");

      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      const theme =
        savedTheme ||
        (prefersDark ? "dark" : "light");

      document.documentElement.setAttribute(
        "data-theme",
        theme
      );
    })();
  </script>

  <style>
    :root {
      --bg: #f5f7fb;
      --surface: #ffffff;
      --surface-soft: #f8fafc;

      --text: #111827;
      --text-strong: #0f172a;
      --muted: #6b7280;
      --muted-2: #9ca3af;

      --line: #e5e7eb;
      --line-strong: #d1d5db;

      --primary: #111827;
      --primary-text: #ffffff;

      --accent: #0f766e;
      --accent-soft: #ecfdf5;

      --blue: #2563eb;
      --blue-soft: #eff6ff;

      --gray: #6b7280;
      --gray-soft: #f3f4f6;

      --danger: #dc2626;
      --danger-soft: #fef2f2;

      --sidebar: #0b1220;
      --sidebar-soft: rgba(255, 255, 255, 0.08);
      --sidebar-line: rgba(255, 255, 255, 0.10);

      --table-head: #f9fafb;
      --thumb-bg: #f3f4f6;

      --radius-xl: 28px;
      --radius-lg: 20px;
      --radius-md: 14px;

      --shadow:
        0 20px 60px rgba(15, 23, 42, 0.08);
    }

    html[data-theme="dark"] {
      --bg: #020617;
      --surface: #0f172a;
      --surface-soft: #111827;

      --text: #e5e7eb;
      --text-strong: #f8fafc;
      --muted: #94a3b8;
      --muted-2: #64748b;

      --line: rgba(255, 255, 255, 0.09);
      --line-strong: rgba(255, 255, 255, 0.16);

      --primary: #2dd4bf;
      --primary-text: #020617;

      --accent: #2dd4bf;
      --accent-soft: rgba(45, 212, 191, 0.12);

      --blue: #60a5fa;
      --blue-soft: rgba(96, 165, 250, 0.14);

      --gray: #94a3b8;
      --gray-soft: rgba(148, 163, 184, 0.13);

      --danger: #fb7185;
      --danger-soft: rgba(251, 113, 133, 0.14);

      --sidebar: #030712;
      --sidebar-soft: rgba(255, 255, 255, 0.09);
      --sidebar-line: rgba(255, 255, 255, 0.10);

      --table-head: #111827;
      --thumb-bg: #111827;

      --shadow:
        0 20px 60px rgba(0, 0, 0, 0.28);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background: var(--bg);

      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    a {
      color: inherit;
    }

    .app {
      min-height: 100vh;
      display: grid;
      grid-template-columns:
        270px minmax(0, 1fr);
    }

    /*
    |--------------------------------------------------------------------------
    | Sidebar
    |--------------------------------------------------------------------------
    */

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      padding: 22px;

      color: #ffffff;

      background:
        radial-gradient(
          circle at top left,
          rgba(20, 184, 166, 0.18),
          transparent 34%
        ),
        var(--sidebar);

      border-right:
        1px solid var(--sidebar-line);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .brand-mark {
      width: 42px;
      height: 42px;

      display: grid;
      place-items: center;

      border-radius: 14px;
      background: #ffffff;
      color: #0b1220;
    }

    html[data-theme="dark"] .brand-mark {
      background: rgba(45, 212, 191, 0.12);
      color: #5eead4;
      border:
        1px solid rgba(45, 212, 191, 0.18);
    }

    .brand-title {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      margin-top: 2px;
      color: rgba(255, 255, 255, 0.55);
      font-size: 12px;
    }

    .nav {
      display: grid;
      gap: 6px;
    }

    .nav a {
      min-height: 42px;
      padding: 0 12px;

      display: flex;
      align-items: center;
      gap: 11px;

      border-radius: 13px;
      text-decoration: none;

      color: rgba(255, 255, 255, 0.68);

      font-size: 14px;
      font-weight: 650;

      transition: 0.18s ease;
    }

    .nav a:hover,
    .nav a.active {
      color: #ffffff;
      background: var(--sidebar-soft);
    }

    .sidebar-footer {
      position: absolute;
      left: 22px;
      right: 22px;
      bottom: 22px;

      padding: 14px;

      border-radius: 18px;
      background: rgba(255, 255, 255, 0.07);
      border:
        1px solid var(--sidebar-line);
    }

    .sidebar-footer span {
      display: block;
      margin-bottom: 6px;

      color: rgba(255, 255, 255, 0.56);
      font-size: 12px;
    }

    .sidebar-footer strong {
      display: block;
      font-size: 13px;
      line-height: 1.4;
      word-break: break-word;
    }

    /*
    |--------------------------------------------------------------------------
    | Main
    |--------------------------------------------------------------------------
    */

    .main {
      min-width: 0;
      padding: 26px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;

      margin-bottom: 22px;
    }

    .page-title h1 {
      margin: 0;

      color: var(--text-strong);
      font-size: 28px;
      letter-spacing: -0.045em;
    }

    .page-title p {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .top-actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 10px;
    }

    .btn,
    .theme-toggle {
      min-height: 42px;
      padding: 0 14px;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      border-radius: 13px;
      border: 1px solid var(--line-strong);

      background: var(--surface);
      color: var(--text);

      text-decoration: none;
      font-size: 14px;
      font-weight: 750;

      cursor: pointer;

      box-shadow:
        0 8px 18px rgba(15, 23, 42, 0.04);

      transition: 0.18s ease;
    }

    .btn:hover,
    .theme-toggle:hover {
      transform: translateY(-1px);
    }

    .btn-primary {
      color: var(--primary-text);
      background: var(--primary);
      border-color: var(--primary);
    }

    .theme-toggle {
      width: 42px;
      padding: 0;
    }

    .theme-icon {
      width: 18px;
      height: 18px;
      display: none;
    }

    html[data-theme="light"] .theme-icon-dark {
      display: block;
    }

    html[data-theme="dark"] .theme-icon-light {
      display: block;
    }

    .icon {
      width: 20px;
      height: 20px;
      display: block;
    }

    .mini-icon {
      width: 15px;
      height: 15px;
      display: inline-block;
      vertical-align: middle;
    }

    /*
    |--------------------------------------------------------------------------
    | Metric
    |--------------------------------------------------------------------------
    */

    .metrics {
      display: grid;
      grid-template-columns:
        repeat(4, minmax(0, 1fr));
      gap: 16px;

      margin-bottom: 16px;
    }

    .metric-card {
      padding: 18px;

      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--line);

      box-shadow:
        0 10px 28px rgba(15, 23, 42, 0.04);
    }

    .metric-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      margin-bottom: 18px;
    }

    .metric-label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
    }

    .metric-icon {
      width: 38px;
      height: 38px;

      display: grid;
      place-items: center;

      border-radius: 13px;
      color: var(--accent);
      background: var(--accent-soft);
    }

    .metric-icon-blue {
      color: var(--blue);
      background: var(--blue-soft);
    }

    .metric-value {
      margin: 0;

      color: var(--text-strong);

      font-size: 34px;
      line-height: 1;
      letter-spacing: -0.05em;

      word-break: break-word;
    }

    .metric-storage {
      font-size: 24px;
      letter-spacing: -0.04em;
    }

    .metric-note {
      min-height: 34px;
      margin-top: 8px;

      color: var(--muted-2);
      font-size: 12px;
      line-height: 1.45;
    }

    .progress-box {
      display: grid;
      gap: 7px;
      margin-top: 10px;
    }

    .progress-track {
      height: 8px;
      overflow: hidden;

      border-radius: 999px;
      background: var(--gray-soft);
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--accent);
    }

    .progress-fill-blue {
      background: var(--blue);
    }

    .progress-caption {
      display: flex;
      justify-content: space-between;
      gap: 8px;

      color: var(--muted-2);
      font-size: 12px;
      line-height: 1.4;
    }

    /*
    |--------------------------------------------------------------------------
    | Panel
    |--------------------------------------------------------------------------
    */

    .content-grid {
      display: grid;

      grid-template-columns:
        minmax(0, 1.45fr)
        minmax(340px, 0.55fr);

      gap: 16px;
    }

    .panel {
      overflow: hidden;

      border-radius: var(--radius-xl);
      background: var(--surface);
      border: 1px solid var(--line);

      box-shadow: var(--shadow);
    }

    .panel-head {
      padding: 18px 20px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      border-bottom: 1px solid var(--line);
    }

    .panel-head h2 {
      margin: 0;

      color: var(--text-strong);

      font-size: 17px;
      letter-spacing: -0.03em;
    }

    .panel-head p {
      margin: 4px 0 0;

      color: var(--muted);
      font-size: 13px;
    }

    .panel-link {
      color: var(--accent);

      text-decoration: none;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
    }

    /*
    |--------------------------------------------------------------------------
    | Table
    |--------------------------------------------------------------------------
    */

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 760px;

      border-collapse: collapse;
    }

    th {
      padding: 12px 20px;

      color: var(--muted);
      background: var(--table-head);

      border-bottom: 1px solid var(--line);

      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    td {
      padding: 14px 20px;

      color: var(--text);
      border-bottom: 1px solid var(--line);

      font-size: 14px;
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .capture-cell {
      min-width: 0;

      display: flex;
      align-items: center;
      gap: 12px;
    }

    .capture-thumb {
      width: 48px;
      height: 48px;
      flex: 0 0 auto;

      overflow: hidden;

      border-radius: 14px;
      background: var(--thumb-bg);
      border: 1px solid var(--line);
    }

    .capture-thumb img {
      width: 100%;
      height: 100%;

      display: block;
      object-fit: cover;
    }

    .capture-info {
      min-width: 0;
    }

    .capture-name {
      max-width: 340px;

      overflow: hidden;

      color: var(--text-strong);

      font-size: 13px;
      font-weight: 750;

      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .capture-meta {
      margin-top: 3px;

      color: var(--muted);
      font-size: 12px;
    }

    .label {
      display: inline-flex;

      padding: 5px 9px;

      border-radius: 999px;

      color: #047857;
      background: var(--accent-soft);

      font-size: 12px;
      font-weight: 800;
    }

    html[data-theme="dark"] .label {
      color: #5eead4;
    }

    .label-blue {
      color: #1d4ed8;
      background: var(--blue-soft);
    }

    html[data-theme="dark"] .label-blue {
      color: #93c5fd;
    }

    .label-gray {
      color: #4b5563;
      background: var(--gray-soft);
    }

    html[data-theme="dark"] .label-gray {
      color: #cbd5e1;
    }

    .row-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;

      color: var(--accent);

      text-decoration: none;
      font-size: 13px;
      font-weight: 800;
    }

    .empty-table {
      padding: 34px 10px;

      color: var(--muted);

      text-align: center;
      font-size: 14px;
    }

    /*
    |--------------------------------------------------------------------------
    | Side panel
    |--------------------------------------------------------------------------
    */

    .side-stack {
      display: grid;
      align-content: start;
      gap: 16px;
    }

    .target-card,
    .split-card,
    .system-card,
    .latest-card {
      padding: 20px;
    }

    .target-list,
    .split-list,
    .system-list {
      display: grid;
      gap: 14px;
      margin-top: 16px;
    }

    .target-item,
    .split-item {
      display: grid;
      gap: 8px;
    }

    .target-head,
    .split-head {
      display: flex;
      justify-content: space-between;
      gap: 10px;

      color: var(--text);
      font-size: 13px;
      font-weight: 750;
    }

    .target-detail {
      color: var(--muted);
      font-size: 12px;
    }

    .track {
      height: 10px;
      overflow: hidden;

      border-radius: 999px;
      background: var(--gray-soft);
    }

    .fill {
      height: 100%;
      border-radius: 999px;
      background: var(--accent);
    }

    .fill-blue {
      background: var(--blue);
    }

    .fill-gray {
      background: var(--gray);
    }

    .system-item {
      padding: 12px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      border-radius: 15px;
      background: var(--surface-soft);
      border: 1px solid var(--line);
    }

    .system-item span {
      color: var(--text);
      font-size: 13px;
      font-weight: 650;
    }

    .system-value {
      max-width: 210px;

      color: var(--muted);

      text-align: right;
      font-size: 12px;
      line-height: 1.4;

      word-break: break-word;
    }

    .status-ok,
    .status-bad {
      display: inline-flex;
      align-items: center;
      gap: 5px;

      font-size: 12px;
      font-weight: 850;
    }

    .status-ok {
      color: var(--accent);
    }

    .status-bad {
      color: var(--danger);
    }

    .latest-preview {
      margin-top: 14px;

      display: block;
      overflow: hidden;

      aspect-ratio: 16 / 10;

      border-radius: 18px;
      border: 1px solid var(--line);
      background: var(--thumb-bg);
    }

    .latest-preview img {
      width: 100%;
      height: 100%;

      display: block;
      object-fit: cover;
    }

    .latest-empty {
      margin-top: 14px;
      padding: 28px 16px;

      border-radius: 18px;
      border: 1px dashed var(--line-strong);
      background: var(--surface-soft);

      color: var(--muted);

      text-align: center;
      font-size: 14px;
    }

    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    .footer-note {
      margin-top: 18px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;

      color: var(--muted-2);
      font-size: 12px;
    }

    .footer-note strong {
      color: var(--muted);
      font-weight: 750;
    }

    /*
    |--------------------------------------------------------------------------
    | Responsive
    |--------------------------------------------------------------------------
    */

    @media (max-width: 1180px) {
      .metrics {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      .app {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
        height: auto;
        border-right: none;
      }

      .sidebar-footer {
        position: static;
        margin-top: 18px;
      }

      .main {
        padding: 20px;
      }
    }

    @media (max-width: 650px) {
      .main {
        padding: 14px;
      }

      .sidebar {
        padding: 18px;
      }

      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .top-actions {
        justify-content: flex-start;
      }

      .metrics {
        grid-template-columns: 1fr;
      }

      .panel-head {
        align-items: flex-start;
        flex-direction: column;
      }

      .metric-value {
        font-size: 30px;
      }
    }
  </style>
</head>

<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          ${iconCamera()}
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
        <a class="active" href="/">
          ${iconGrid()} Dashboard
        </a>

        <a href="/gallery">
          ${iconCamera()} Gallery
        </a>

        <a href="/summary">
          ${iconChart()} Summary
        </a>

        <a href="/test-upload">
          ${iconUpload()} Upload
        </a>

        <a href="/docs">
          ${iconDocs()} Docs
        </a>

        <a href="/status">
          ${iconSettings()} Settings
        </a>
      </nav>

      <div class="sidebar-footer">
        <span>Storage folder</span>

        <strong>
          ${
            escapeHtml(
              config.folder ||
              "skripsi_dataset_medis"
            )
          }
        </strong>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="page-title">
          <h1>Dataset Capture</h1>

          <p>
            Target 3.000 citra:
            1.500 medis dan 1.500 non-medis.
          </p>
        </div>

        <div class="top-actions">
          <button
            class="theme-toggle"
            id="themeToggle"
            type="button"
            aria-label="Ganti tema"
          >
            ${iconMoon()}
            ${iconSun()}
          </button>

          <a class="btn" href="/">
            ${iconRefresh()} Sinkronkan
          </a>

          <a class="btn" href="/docs">
            ${iconDocs()} Docs
          </a>

          <a class="btn" href="/gallery">
            ${iconCamera()} Gallery
          </a>

          <a
            class="btn btn-primary"
            href="/test-upload"
          >
            ${iconUpload()} Upload image
          </a>
        </div>
      </header>

      <!-- Metric utama -->
      <section class="metrics">
        <article class="metric-card">
          <div class="metric-top">
            <div class="metric-label">
              Total dataset
            </div>

            <div class="metric-icon">
              ${iconTarget()}
            </div>
          </div>

          <h2 class="metric-value">
            ${total}
          </h2>

          <div class="metric-note">
            Target ${DATASET_TARGET} gambar
            · kurang ${remainingTotal}
          </div>

          <div class="progress-box">
            <div class="progress-track">
              <div
                class="progress-fill"
                style="width: ${totalProgress}%;"
              ></div>
            </div>

            <div class="progress-caption">
              <span>${totalProgress}% tercapai</span>
              <span>${total}/${DATASET_TARGET}</span>
            </div>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <div class="metric-label">
              Limbah medis
            </div>

            <div class="metric-icon">
              ${iconCheck()}
            </div>
          </div>

          <h2 class="metric-value">
            ${medis}
          </h2>

          <div class="metric-note">
            Target ${MEDICAL_TARGET} gambar
            · kurang ${remainingMedical}
          </div>

          <div class="progress-box">
            <div class="progress-track">
              <div
                class="progress-fill"
                style="width: ${medicalProgress}%;"
              ></div>
            </div>

            <div class="progress-caption">
              <span>${medicalProgress}% tercapai</span>
              <span>${medis}/${MEDICAL_TARGET}</span>
            </div>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <div class="metric-label">
              Limbah non-medis
            </div>

            <div class="metric-icon metric-icon-blue">
              ${iconGrid()}
            </div>
          </div>

          <h2 class="metric-value">
            ${nonMedis}
          </h2>

          <div class="metric-note">
            Target ${NON_MEDICAL_TARGET} gambar
            · kurang ${remainingNonMedical}
          </div>

          <div class="progress-box">
            <div class="progress-track">
              <div
                class="progress-fill progress-fill-blue"
                style="width: ${nonMedicalProgress}%;"
              ></div>
            </div>

            <div class="progress-caption">
              <span>${nonMedicalProgress}% tercapai</span>
              <span>
                ${nonMedis}/${NON_MEDICAL_TARGET}
              </span>
            </div>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <div class="metric-label">
              Total storage
            </div>

            <div class="metric-icon">
              ${iconStorage()}
            </div>
          </div>

          <h2 class="metric-value metric-storage">
            ${formatBytes(totalBytes)}
          </h2>

          <div class="metric-note">
            Akumulasi ukuran seluruh gambar
            yang tercatat.
          </div>

          <div class="progress-box">
            <div class="progress-track">
              <div
                class="progress-fill"
                style="width: ${total > 0 ? 100 : 0}%;"
              ></div>
            </div>

            <div class="progress-caption">
              <span>Rata-rata per gambar</span>
              <span>
                ${formatBytes(averageFileSize)}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section class="content-grid">
        <!-- Tabel upload terbaru -->
        <div class="panel">
          <div class="panel-head">
            <div>
              <h2>Recent captures</h2>

              <p>
                15 citra terbaru yang tercatat
                setelah sinkronisasi.
              </p>
            </div>

            <a
              class="panel-link"
              href="/gallery"
            >
              Lihat semua
            </a>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Label</th>
                  <th>Resolusi</th>
                  <th>Ukuran</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                ${recentRows}
              </tbody>
            </table>
          </div>
        </div>

        <aside class="side-stack">
          <!-- Progress target -->
          <div class="panel target-card">
            <div
              class="panel-head"
              style="
                padding: 0;
                border-bottom: none;
              "
            >
              <div>
                <h2>Target collection</h2>

                <p>
                  Kemajuan terhadap target tiap kelas.
                </p>
              </div>
            </div>

            <div class="target-list">
              <div class="target-item">
                <div class="target-head">
                  <span>Total dataset</span>
                  <strong>${totalProgress}%</strong>
                </div>

                <div class="track">
                  <div
                    class="fill"
                    style="width: ${totalProgress}%;"
                  ></div>
                </div>

                <div class="target-detail">
                  ${total} dari ${DATASET_TARGET}
                  gambar, kurang ${remainingTotal}.
                </div>
              </div>

              <div class="target-item">
                <div class="target-head">
                  <span>Medis</span>
                  <strong>${medicalProgress}%</strong>
                </div>

                <div class="track">
                  <div
                    class="fill"
                    style="width: ${medicalProgress}%;"
                  ></div>
                </div>

                <div class="target-detail">
                  ${medis} dari ${MEDICAL_TARGET}
                  gambar, kurang ${remainingMedical}.
                </div>
              </div>

              <div class="target-item">
                <div class="target-head">
                  <span>Non-medis</span>
                  <strong>
                    ${nonMedicalProgress}%
                  </strong>
                </div>

                <div class="track">
                  <div
                    class="fill fill-blue"
                    style="
                      width: ${nonMedicalProgress}%;
                    "
                  ></div>
                </div>

                <div class="target-detail">
                  ${nonMedis}
                  dari ${NON_MEDICAL_TARGET}
                  gambar, kurang
                  ${remainingNonMedical}.
                </div>
              </div>
            </div>
          </div>

          <!-- Komposisi data -->
          <div class="panel split-card">
            <div
              class="panel-head"
              style="
                padding: 0;
                border-bottom: none;
              "
            >
              <div>
                <h2>Dataset composition</h2>

                <p>
                  Persentase berdasarkan data aktual.
                </p>
              </div>
            </div>

            <div class="split-list">
              <div class="split-item">
                <div class="split-head">
                  <span>Medis</span>

                  <strong>
                    ${medisComposition}%
                  </strong>
                </div>

                <div class="track">
                  <div
                    class="fill"
                    style="
                      width: ${medisComposition}%;
                    "
                  ></div>
                </div>
              </div>

              <div class="split-item">
                <div class="split-head">
                  <span>Non-medis</span>

                  <strong>
                    ${nonMedisComposition}%
                  </strong>
                </div>

                <div class="track">
                  <div
                    class="fill fill-blue"
                    style="
                      width: ${nonMedisComposition}%;
                    "
                  ></div>
                </div>
              </div>

              <div class="split-item">
                <div class="split-head">
                  <span>Unknown</span>

                  <strong>
                    ${unknownComposition}%
                  </strong>
                </div>

                <div class="track">
                  <div
                    class="fill fill-gray"
                    style="
                      width: ${unknownComposition}%;
                    "
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status sistem -->
          <div class="panel system-card">
            <div
              class="panel-head"
              style="
                padding: 0;
                border-bottom: none;
              "
            >
              <div>
                <h2>System</h2>

                <p>
                  Status backend dan sinkronisasi.
                </p>
              </div>
            </div>

            <div class="system-list">
              <div class="system-item">
                <span>Device key</span>

                ${
                  config.deviceKeyReady
                    ? `
                      <strong class="status-ok">
                        ${iconCheck()} Ready
                      </strong>
                    `
                    : `
                      <strong class="status-bad">
                        Missing
                      </strong>
                    `
                }
              </div>

              <div class="system-item">
                <span>Cloudinary config</span>

                ${
                  config.cloudinaryReady
                    ? `
                      <strong class="status-ok">
                        ${iconCheck()} Ready
                      </strong>
                    `
                    : `
                      <strong class="status-bad">
                        Missing
                      </strong>
                    `
                }
              </div>

              <div class="system-item">
                <span>Cloud sync</span>

                ${
                  syncReady
                    ? `
                      <strong class="status-ok">
                        ${iconCheck()} Synced
                      </strong>
                    `
                    : `
                      <strong class="status-bad">
                        Failed
                      </strong>
                    `
                }
              </div>

              <div class="system-item">
                <span>Sync info</span>

                <strong
                  class="system-value ${
                    syncReady
                      ? "status-ok"
                      : "status-bad"
                  }"
                >
                  ${escapeHtml(syncMessage)}
                </strong>
              </div>

              <div class="system-item">
                <span>Last sync</span>

                <strong class="system-value">
                  ${escapeHtml(lastSyncedAt)}
                </strong>
              </div>

              <div class="system-item">
                <span>Upload limit</span>

                <strong class="status-ok">
                  ${iconCheck()} 5 MB
                </strong>
              </div>
            </div>
          </div>

          <!-- Preview terbaru -->
          <div class="panel latest-card">
            <div
              class="panel-head"
              style="
                padding: 0;
                border-bottom: none;
              "
            >
              <div>
                <h2>Latest preview</h2>

                <p>
                  Citra terbaru yang masih tersedia.
                </p>
              </div>
            </div>

            ${
              latestUpload
                ? `
                  <a
                    class="latest-preview"
                    href="${
                      escapeHtml(
                        latestUpload.secure_url || ""
                      )
                    }"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src="${
                        escapeHtml(
                          latestUpload.secure_url || ""
                        )
                      }"
                      alt="Latest capture"
                    />
                  </a>
                `
                : `
                  <div class="latest-empty">
                    Belum ada preview.
                  </div>
                `
            }
          </div>
        </aside>
      </section>

      <div class="footer-note">
        <span>
          Prototype backend · medical waste
          image dataset
        </span>

        <strong>
          © ${new Date().getFullYear()}
          Reni Kartika Suwandi.
          All rights reserved.
        </strong>
      </div>
    </main>
  </div>

  <script>
    const root =
      document.documentElement;

    const themeToggle =
      document.getElementById("themeToggle");

    themeToggle?.addEventListener(
      "click",
      () => {
        const currentTheme =
          root.getAttribute("data-theme");

        const nextTheme =
          currentTheme === "dark"
            ? "light"
            : "dark";

        root.setAttribute(
          "data-theme",
          nextTheme
        );

        localStorage.setItem(
          "capture-panel-theme",
          nextTheme
        );
      }
    );
  </script>
</body>
</html>
`;
}

module.exports = dashboardView;