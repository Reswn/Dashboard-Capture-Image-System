const formatBytes = require("../utils/formatBytes");

function iconCamera() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M4 8.5C4 7.12 5.12 6 6.5 6h1.17c.53 0 1.04-.21 1.41-.59l.83-.82c.37-.38.88-.59 1.41-.59h1.36c.53 0 1.04.21 1.41.59l.83.82c.37.38.88.59 1.41.59h1.17C18.88 6 20 7.12 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" stroke="currentColor" stroke-width="1.8"/>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8"/>
    </svg>
  `;
}

function iconGrid() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z" stroke="currentColor" stroke-width="1.8"/>
    </svg>
  `;
}

function iconGallery() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" stroke="currentColor" stroke-width="1.8"/>
      <path d="m5 17 4.5-4.5a1.5 1.5 0 0 1 2.1 0l1.4 1.4 2.2-2.2a1.5 1.5 0 0 1 2.1 0L20 14.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function iconUpload() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M12 15V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9A2.5 2.5 0 0 0 19 17.5V15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
}

function iconChart() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M5 19V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8.5 16v-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 16V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M15.5 16v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
}

function iconDocs() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" stroke="currentColor" stroke-width="1.8"/>
      <path d="M14 3.5V8h4.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9 13h6M9 16h6M9 10h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
}

function iconSettings() {
  return `
    <svg viewBox="0 0 24 24" class="icon" fill="none" aria-hidden="true">
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" stroke-width="1.8"/>
      <path d="M19.4 13.5c.08-.49.1-.99.05-1.5.05-.51.03-1.01-.05-1.5l1.55-1.2-1.9-3.3-1.85.75a7.4 7.4 0 0 0-2.6-1.5L14.35 3h-3.8l-.25 2.25a7.4 7.4 0 0 0-2.6 1.5L5.85 6l-1.9 3.3 1.55 1.2A7.8 7.8 0 0 0 5.45 12c-.05.51-.03 1.01.05 1.5l-1.55 1.2 1.9 3.3 1.85-.75a7.4 7.4 0 0 0 2.6 1.5l.25 2.25h3.8l.25-2.25a7.4 7.4 0 0 0 2.6-1.5l1.85.75 1.9-3.3-1.55-1.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `;
}

function iconExternal() {
  return `
    <svg viewBox="0 0 24 24" class="mini-icon" fill="none" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function iconMoon() {
  return `
    <svg class="theme-icon theme-icon-dark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 14.2A7.8 7.8 0 0 1 9.8 3 8.8 8.8 0 1 0 21 14.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `;
}

function iconSun() {
  return `
    <svg class="theme-icon theme-icon-light" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4V2.5M12 21.5V20M4 12H2.5M21.5 12H20M5.6 5.6 4.5 4.5M19.5 19.5l-1.1-1.1M18.4 5.6l1.1-1.1M4.5 19.5l1.1-1.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.8"/>
    </svg>
  `;
}

function galleryView({ uploads = [], summary = {} }) {
  const total = summary.total || 0;
  const medis = summary.medis || 0;
  const nonMedis = summary.non_medis || 0;
  const unknown = summary.unknown || 0;

  const cards =
    uploads.length > 0
      ? uploads
          .map(
            (item) => `
              <article class="dataset-card" data-label="${item.label}">
                <a class="image-wrap" href="${item.secure_url}" target="_blank" rel="noreferrer">
                  <img src="${item.secure_url}" alt="Dataset image ${item.public_id}" />
                </a>

                <div class="card-content">
                  <div class="card-topline">
                    <span class="label ${
                      item.label === "non_medis"
                        ? "label-blue"
                        : item.label === "unknown"
                        ? "label-gray"
                        : ""
                    }">
                      ${item.label}
                    </span>

                    <span class="source">${item.source || "esp32cam"}</span>
                  </div>

                  <h3>${item.public_id}</h3>

                  <div class="meta">
                    <span>${item.width || "-"} × ${item.height || "-"}</span>
                    <span>${formatBytes(item.bytes || 0)}</span>
                    <span>${String(item.format || "jpg").toUpperCase()}</span>
                  </div>

                  <a class="open-link" href="${item.secure_url}" target="_blank" rel="noreferrer">
                    Open file ${iconExternal()}
                  </a>
                </div>
              </article>
            `
          )
          .join("")
      : `
        <div class="empty">
          <div class="empty-icon">${iconGallery()}</div>
          <h2>Belum ada gambar</h2>
          <p>Upload gambar manual atau kirim capture dari ESP32-CAM untuk mulai mengisi gallery.</p>
          <a class="btn btn-primary" href="/test-upload">${iconUpload()} Upload image</a>
        </div>
      `;

  return `
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Gallery · Capture Panel</title>

  <script>
    (function () {
      const savedTheme = localStorage.getItem("capture-panel-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = savedTheme || (prefersDark ? "dark" : "light");

      document.documentElement.setAttribute("data-theme", theme);
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
      --gray-soft: #f3f4f6;
      --danger: #dc2626;
      --danger-soft: #fef2f2;
      --radius-xl: 28px;
      --radius-lg: 20px;
      --radius-md: 14px;
      --shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
      --sidebar: #0b1220;
      --sidebar-soft: rgba(255, 255, 255, 0.08);
      --sidebar-line: rgba(255, 255, 255, 0.10);
      --thumb-bg: #f3f4f6;
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
      --gray-soft: rgba(148, 163, 184, 0.13);
      --danger: #fb7185;
      --danger-soft: rgba(251, 113, 133, 0.14);
      --shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
      --sidebar: #030712;
      --sidebar-soft: rgba(255, 255, 255, 0.09);
      --sidebar-line: rgba(255, 255, 255, 0.10);
      --thumb-bg: #111827;
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
      grid-template-columns: 270px minmax(0, 1fr);
    }

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      padding: 22px;
      background:
        radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 34%),
        var(--sidebar);
      color: #ffffff;
      border-right: 1px solid var(--sidebar-line);
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
      border: 1px solid rgba(45, 212, 191, 0.18);
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
      display: flex;
      align-items: center;
      gap: 11px;
      min-height: 42px;
      padding: 0 12px;
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
      border: 1px solid var(--sidebar-line);
    }

    .sidebar-footer span {
      display: block;
      color: rgba(255, 255, 255, 0.56);
      font-size: 12px;
      margin-bottom: 6px;
    }

    .sidebar-footer strong {
      display: block;
      font-size: 13px;
      line-height: 1.4;
    }

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
      font-size: 28px;
      letter-spacing: -0.045em;
      color: var(--text-strong);
    }

    .page-title p {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .top-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn,
    .theme-toggle {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 14px;
      border-radius: 13px;
      border: 1px solid var(--line-strong);
      background: var(--surface);
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 750;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
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
      cursor: pointer;
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

    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .metric-card {
      padding: 18px;
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
    }

    .metric-label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
      margin-bottom: 12px;
    }

    .metric-value {
      margin: 0;
      font-size: 32px;
      line-height: 1;
      letter-spacing: -0.05em;
      color: var(--text-strong);
    }

    .metric-note {
      margin-top: 8px;
      color: var(--muted-2);
      font-size: 12px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
      padding: 14px;
      border-radius: var(--radius-lg);
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
    }

    .toolbar-title {
      color: var(--text-strong);
      font-weight: 850;
      letter-spacing: -0.02em;
    }

    .filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .filter-btn {
      min-height: 36px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      color: var(--text);
      font: inherit;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
      transition: 0.18s ease;
    }

    .filter-btn:hover,
    .filter-btn.active {
      color: var(--accent);
      background: var(--accent-soft);
      border-color: rgba(15, 118, 110, 0.22);
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .dataset-card {
      overflow: hidden;
      border-radius: var(--radius-xl);
      background: var(--surface);
      border: 1px solid var(--line);
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
    }

    .image-wrap {
      display: block;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      background: var(--thumb-bg);
      border-bottom: 1px solid var(--line);
    }

    .image-wrap img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      transition: transform 0.25s ease;
    }

    .dataset-card:hover img {
      transform: scale(1.035);
    }

    .card-content {
      padding: 14px;
    }

    .card-topline {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
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

    .source {
      color: var(--muted);
      font-size: 12px;
    }

    .dataset-card h3 {
      margin: 0 0 12px;
      color: var(--text-strong);
      font-size: 14px;
      line-height: 1.45;
      letter-spacing: -0.02em;
      word-break: break-word;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-bottom: 12px;
    }

    .meta span {
      padding: 5px 8px;
      border-radius: 9px;
      color: var(--muted);
      background: var(--surface-soft);
      font-size: 12px;
      border: 1px solid var(--line);
    }

    .open-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--accent);
      text-decoration: none;
      font-size: 14px;
      font-weight: 800;
    }

    .empty {
      grid-column: 1 / -1;
      display: grid;
      place-items: center;
      text-align: center;
      padding: 52px 20px;
      border: 1px dashed var(--line-strong);
      border-radius: var(--radius-xl);
      background: var(--surface);
    }

    .empty-icon {
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      margin-bottom: 14px;
      border-radius: 18px;
      color: var(--accent);
      background: var(--accent-soft);
      border: 1px solid var(--line);
    }

    .empty h2 {
      margin: 0 0 8px;
      font-size: 22px;
      letter-spacing: -0.03em;
      color: var(--text-strong);
    }

    .empty p {
      max-width: 520px;
      margin: 0 0 18px;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .footer-note {
      margin-top: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      color: var(--muted-2);
      font-size: 12px;
      flex-wrap: wrap;
    }

    .footer-note strong {
      color: var(--muted);
      font-weight: 750;
    }

    @media (max-width: 1120px) {
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

      .metrics {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .gallery-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .top-actions {
        justify-content: flex-start;
      }

      .metrics,
      .gallery-grid {
        grid-template-columns: 1fr;
      }

      .toolbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .filters {
        justify-content: flex-start;
      }

      .sidebar {
        padding: 18px;
      }

      .main {
        padding: 14px;
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
          <div class="brand-title">Capture Panel</div>
          <div class="brand-subtitle">ESP32-CAM Dataset</div>
        </div>
      </div>

      <nav class="nav">
        <a href="/">${iconGrid()} Dashboard</a>
        <a class="active" href="/gallery">${iconCamera()} Gallery</a>
        <a href="/summary">${iconChart()} Summary</a>
        <a href="/test-upload">${iconUpload()} Upload</a>
        <a href="/docs">${iconDocs()} Docs</a>
        <a href="/status">${iconSettings()} Settings</a>
      </nav>

      <div class="sidebar-footer">
        <span>Current page</span>
        <strong>Gallery</strong>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="page-title">
          <h1>Gallery</h1>
          <p>Kumpulan citra yang sudah diterima backend.</p>
        </div>

        <div class="top-actions">
          <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle dark mode">
            ${iconMoon()}
            ${iconSun()}
          </button>

          <a class="btn" href="/summary">${iconChart()} Summary</a>
          <a class="btn btn-primary" href="/test-upload">${iconUpload()} Upload image</a>
        </div>
      </header>

      <section class="metrics">
        <article class="metric-card">
          <div class="metric-label">Total images</div>
          <h2 class="metric-value">${total}</h2>
          <div class="metric-note">Sesi server aktif</div>
        </article>

        <article class="metric-card">
          <div class="metric-label">Medical</div>
          <h2 class="metric-value">${medis}</h2>
          <div class="metric-note">Label medis</div>
        </article>

        <article class="metric-card">
          <div class="metric-label">Non-medical</div>
          <h2 class="metric-value">${nonMedis}</h2>
          <div class="metric-note">Label non-medis</div>
        </article>

        <article class="metric-card">
          <div class="metric-label">Unknown</div>
          <h2 class="metric-value">${unknown}</h2>
          <div class="metric-note">Belum diklasifikasi</div>
        </article>
      </section>

      <section class="toolbar">
        <div class="toolbar-title">Dataset images</div>

        <div class="filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="medis">Medical</button>
          <button class="filter-btn" data-filter="non_medis">Non-medical</button>
          <button class="filter-btn" data-filter="unknown">Unknown</button>
        </div>
      </section>

      <section class="gallery-grid" id="galleryGrid">
        ${cards}
      </section>

      <div class="footer-note">
        <span>Prototype backend · dataset gallery</span>
        <strong>© ${new Date().getFullYear()} Reni Kartika Suwandi. All rights reserved.</strong>
      </div>
    </main>
  </div>

  <script>
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");

    themeToggle?.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem("capture-panel-theme", nextTheme);
    });

    const filterButtons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".dataset-card");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        cards.forEach((card) => {
          const label = card.dataset.label;
          const visible = filter === "all" || label === filter;

          card.style.display = visible ? "block" : "none";
        });
      });
    });
  </script>
</body>
</html>
`;
}

module.exports = galleryView;