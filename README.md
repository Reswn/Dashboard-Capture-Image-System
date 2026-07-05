<div align="center">

# Dashboard Capture Image System

Dashboard dan backend akuisisi citra limbah medis berbasis **Node.js**, **Express**, **Cloudinary**, dan **Vercel**.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Source_of_Truth-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-F7DF1E?logo=javascript&logoColor=000000)](https://developer.mozilla.org/docs/Web/JavaScript)

[Demo Aplikasi](https://dashboard-capture-image-system-theta.vercel.app) ·
[Repository Firmware ESP32-CAM](https://github.com/Reswn/esp32cam-waste-firmware)

</div>

---

## Tentang Proyek

**Dashboard Capture Image System** digunakan untuk menerima, menyimpan, menampilkan, dan mengelola citra limbah medis serta nonmedis yang dikirim dari ESP32-CAM atau halaman upload manual.

Cloudinary digunakan sebagai **sumber data utama**. Sistem tidak memakai MongoDB maupun file JSON lokal sebagai basis data. Citra, label, sumber pengambilan, waktu akuisisi, tag, dan contextual metadata dikelola langsung melalui Cloudinary.

<p align="center">
  <img src="docs/dashboard-architecture.svg" alt="Arsitektur Dashboard Capture Image System" width="100%">
</p>

## Fitur Utama

- Menerima upload citra dari ESP32-CAM melalui `multipart/form-data`.
- Autentikasi perangkat menggunakan header `x-device-key`.
- Menyimpan gambar, tag, dan contextual metadata di Cloudinary.
- Menampilkan dashboard ringkasan dan citra terbaru.
- Menampilkan galeri dengan filter kelas dan pencarian.
- Pagination galeri menggunakan `next_cursor` dari Cloudinary.
- Koreksi label satu gambar.
- Bulk update label maksimal 100 gambar.
- Ringkasan jumlah data medis, nonmedis, unknown, dan ukuran dataset.
- Halaman upload manual, dokumentasi endpoint, dan status backend.
- Dark mode pada antarmuka.
- Kompatibel dengan deployment serverless di Vercel.

## Arsitektur Sistem

```text
ESP32-CAM / Upload Manual
          │
          │ HTTPS POST /api/upload
          │ image + label + source
          ▼
Node.js + Express di Vercel
          │
          │ validasi file dan device key
          ▼
Cloudinary
          │
          ├── image
          ├── tags
          ├── contextual metadata
          └── next_cursor
          │
          ▼
Dashboard · Gallery · Summary · Koreksi Label
```

## Teknologi

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js |
| Backend | Express |
| Upload | Multer memory storage |
| Penyimpanan | Cloudinary |
| Antarmuka | Server-rendered HTML, CSS, dan JavaScript |
| Deployment | Vercel |
| Autentikasi perangkat | Header `x-device-key` |
| Pagination | Cloudinary `next_cursor` |

## Halaman Aplikasi

| URL | Fungsi |
|---|---|
| `/` | Dashboard dan citra terbaru |
| `/gallery` | Galeri dataset, filter, pencarian, dan koreksi label |
| `/summary` | Ringkasan jumlah dan ukuran dataset |
| `/test-upload` | Pengujian upload manual |
| `/docs` | Dokumentasi endpoint |
| `/status` | Status konfigurasi backend |
| `/health` | Health check utama |

Contoh URL galeri:

```text
/gallery?limit=20&label=all
/gallery?limit=50&label=medis
/gallery?cursor=NEXT_CURSOR&limit=100&label=non_medis
```

Nilai `limit` yang didukung:

```text
20
50
100
```

Nilai filter label:

```text
all
medis
non_medis
unknown
```

## API Endpoint

### Health Check

```http
GET /health
GET /api/health
```

### Daftar Citra

```http
GET /api/uploads?limit=20&label=all
```

Respons pagination:

```json
{
  "success": true,
  "total": 3000,
  "count": 20,
  "pagination": {
    "cursor": "",
    "next_cursor": "NEXT_CURSOR",
    "has_more": true,
    "limit": 20,
    "label": "all"
  },
  "data": []
}
```

### Ringkasan Dataset

```http
GET /api/summary
```

### Upload Citra

```http
POST /api/upload
Content-Type: multipart/form-data
x-device-key: DEVICE_SECRET_KEY
```

Field form-data:

| Field | Tipe | Keterangan |
|---|---|---|
| `image` | File | JPG, JPEG, atau PNG |
| `label` | String | `medis`, `non_medis`, atau `unknown` |
| `source` | String | Contoh: `esp32cam`, `button`, `web`, atau `manual` |

Ukuran file maksimal:

```text
4 MB
```

Contoh dengan cURL:

```bash
curl -X POST "http://localhost:5000/api/upload" \
  -H "x-device-key: DEVICE_SECRET_KEY" \
  -F "image=@contoh.jpg" \
  -F "label=medis" \
  -F "source=manual"
```

### Koreksi Satu Label

```http
POST /api/update-label
Content-Type: application/json
```

```json
{
  "public_id": "skripsi_dataset_medis/nama_gambar",
  "label": "non_medis"
}
```

### Bulk Update Label

```http
POST /api/update-labels-bulk
Content-Type: application/json
```

```json
{
  "public_ids": [
    "skripsi_dataset_medis/gambar_1",
    "skripsi_dataset_medis/gambar_2"
  ],
  "label": "medis"
}
```

Bulk update dibatasi maksimal 100 gambar dalam satu permintaan.

## Metadata Cloudinary

Upload baru menyimpan metadata berikut:

```text
label
source
captured_at
```

Koreksi label menambahkan atau memperbarui:

```text
actual_label
label
label_updated_at
```

Tag yang digunakan antara lain:

```text
dataset
dataset_limbah
medis
non_medis
unknown
label_medis
label_non_medis
label_unknown
source_esp32cam
source_button
source_web
source_manual
```

## Struktur Proyek

```text
Dashboard-Capture-Image-System/
├── config/
│   └── cloudinary.js
├── middleware/
│   └── authDevice.js
├── public/
│   └── favicon.svg
├── routes/
│   ├── apiRoutes.js
│   ├── labelRoutes.js
│   ├── pageRoutes.js
│   └── uploadRoutes.js
├── services/
│   └── cloudinaryRepository.js
├── utils/
│   ├── formatBytes.js
│   └── uploadToCloudinary.js
├── views/
│   ├── dashboardView.js
│   ├── docsView.js
│   ├── galleryView.js
│   ├── statusView.js
│   ├── summaryView.js
│   └── testUploadView.js
├── docs/
│   └── dashboard-architecture.svg
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Instalasi Lokal

Clone repository:

```bash
git clone https://github.com/Reswn/Dashboard-Capture-Image-System.git
cd Dashboard-Capture-Image-System
```

Install dependency:

```bash
npm install
```

Salin konfigurasi environment:

```bash
cp .env.example .env
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi file `.env`:

```env
PORT=5000

DEVICE_SECRET_KEY=your_device_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=skripsi_dataset_medis
CLOUDINARY_DATASET_TAG=dataset_limbah
```

Jalankan mode pengembangan:

```bash
npm run dev
```

Jalankan mode biasa:

```bash
npm start
```

Aplikasi lokal:

```text
http://localhost:5000
```

## Pengujian Lokal

Buka endpoint berikut secara berurutan:

```text
http://localhost:5000/health
http://localhost:5000/api/health
http://localhost:5000/api/uploads?limit=20&label=all
http://localhost:5000/api/summary
http://localhost:5000/
http://localhost:5000/gallery?limit=20&label=all
http://localhost:5000/test-upload
http://localhost:5000/status
```

Alur pengujian utama:

```text
Upload gambar
→ gambar masuk Cloudinary
→ tampil pada Dashboard
→ tampil pada Gallery
→ filter bekerja
→ koreksi label bekerja
→ bulk update bekerja
→ summary diperbarui
```

## Deployment ke Vercel

1. Push repository ke GitHub.
2. Import repository pada Vercel.
3. Tambahkan seluruh environment variable.
4. Deploy project.
5. Uji `/health`, `/api/health`, `/gallery`, dan `/test-upload`.

Environment variable rahasia harus disimpan pada pengaturan project Vercel, bukan ditulis langsung di source code.

## Integrasi ESP32-CAM

Firmware perangkat tersedia di:

```text
https://github.com/Reswn/esp32cam-waste-firmware
```

Konfigurasi firmware:

```cpp
const char* BACKEND_HOST =
  "dashboard-capture-image-system-theta.vercel.app";

const uint16_t BACKEND_PORT =
  443;

const char* BACKEND_PATH =
  "/api/upload";

const char* DEVICE_SECRET_KEY =
  "KEY_YANG_SAMA_DENGAN_VERCEL";
```

ESP32-CAM mengirim:

```text
HTTPS multipart/form-data
image + label + source
x-device-key
```

## Keamanan

- Jangan commit file `.env`.
- Jangan menaruh `DEVICE_SECRET_KEY` atau Cloudinary API Secret pada repository publik.
- Gunakan key yang berbeda untuk development dan production bila diperlukan.
- Ganti key segera apabila pernah terekspos.
- Batasi ukuran file dan jenis MIME.
- Gunakan HTTPS untuk komunikasi perangkat dengan backend.
- Pastikan hanya perangkat tepercaya yang mengetahui `DEVICE_SECRET_KEY`.

## Pemecahan Masalah

### `401 Unauthorized device`

Periksa apakah header berikut dikirim:

```http
x-device-key: DEVICE_SECRET_KEY
```

Nilainya harus sama dengan environment variable backend.

### Konfigurasi Cloudinary belum lengkap

Periksa:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
```

Setelah mengubah environment variable pada Vercel, lakukan redeploy.

### `413 Payload Too Large`

Gunakan gambar di bawah 4 MB. Untuk ESP32-CAM, gunakan resolusi VGA atau QVGA dan kompresi JPEG yang sesuai.

### Gallery tidak menampilkan label terbaru

Muat ulang halaman Gallery. Gallery menggunakan pembacaan langsung dari Cloudinary dan tidak memakai cache CDN untuk data label.

### Tombol berikutnya tidak aktif

Tombol hanya aktif ketika Cloudinary mengembalikan `next_cursor`.

## Konteks Penelitian

Sistem ini dikembangkan sebagai bagian dari penelitian:

> **Sistem Akuisisi dan Dokumentasi Citra Berbasis ESP32-CAM dengan Evaluasi Model CNN Terkuantisasi untuk Klasifikasi Indikatif Limbah Medis**

Dashboard berfungsi sebagai sarana dokumentasi dataset, pengelolaan label, pemantauan jumlah data, dan pengujian alur akuisisi citra.

## Pengembang

**Reni Kartika Suwandi**  
Program Studi Informatika  
Fakultas Teknologi Informasi  
Universitas Sebelas April
