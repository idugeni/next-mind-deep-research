# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.2] - 2025-04-18

### Changed
- Penyelarasan versi Next.js, TypeScript, dan Tailwind CSS pada README dan badge agar konsisten dengan package.json.
- Pengelompokan dan penataan ulang badge menjadi beberapa kategori (Utama, Status & Community, Quality & Tech, Motivasi & Open Source) dengan style flat dan tampilan kecil.
- Penambahan/memperbaiki SVG wave divider dan elemen visual untuk mempercantik README.
- Semua perintah kode pada README kini dikemas dalam tag <pre><code>...</code></pre> agar mudah dicopy dan konsisten.
- Seluruh padding pada section README dihapus dan diganti dengan margin untuk konsistensi jarak antar section.

### Removed
- Menghapus badge motivasi duplikat agar tidak tampil ganda.

## [2.0.0] - 2025-04-18

### Added
- Integrasi Jest + Testing Library untuk pengujian unit dan komponen.
- CI/CD workflow dengan GitHub Actions untuk test otomatis pada setiap push/PR.
- Dukungan penuh TypeScript & Next.js 14.
- Penambahan file konfigurasi profesional: `jest.config.mjs`, `tsconfig.jest.json`, `.env.example`, serta dokumentasi markdown (README, CONTRIBUTING, LICENSE, dsb).
- Penambahan struktur dan tipe data report (`src/types/report.ts`).
- Fitur pencarian hasil riset dengan model Gemini 2.5 Flash Preview.
- Penambahan dan perbaikan struktur folder, modularisasi komponen, serta utilitas error handling.
- Penambahan dan perbaikan file konfigurasi Tailwind, Turbo, dan ESLint.

### Changed
- Refaktor besar pada struktur dan presentasi report agar lebih sesuai best practice riset (penambahan section Literature Review, Critical Appraisal, dsb).
- Peningkatan tata letak dan tipografi report dengan Tailwind CSS `.prose`.
- Perbaikan parsing referensi dan web scraping konten (lebih akurat dan robust).
- Refaktor error handling di API/backend agar lebih terpusat dan mudah dilacak.
- Migrasi manajemen paket dari PNPM ke NPM, serta adopsi Turborepo untuk build orchestration.

### Fixed
- Perbaikan error kompatibilitas Jest/TypeScript pada Next.js modern (moduleResolution, tsconfig, dsb).
- Penanganan error parsing konten web dan fallback yang lebih baik.
- Perbaikan bug minor pada UI dan komponen pencarian/report.

---

## [1.0.0] - 2025-04-14

### Added
- Inisialisasi project NextMind Research Tool dengan Next.js, TypeScript, dan setup awal komponen utama.
- Penambahan struktur dasar folder, halaman utama, dan utilitas awal.
