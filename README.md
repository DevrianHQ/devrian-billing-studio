# DEVRIAN Billing Studio

DEVRIAN Billing Studio is a high-performance, single-user, browser-only web application designed to generate print-ready A4 PDFs for **Invoices** and **Payment Receipts**.

Designed with DEVRIAN's graphic aesthetic: strict monochromatic palette (`#0E0E0E`, `#6B6B6B`, `#E5E5E5`, `#F0F0F0`), geometric header facets, strong typographic hierarchy, and a subtle watermark.

---

## Features

- **Offline-First & Serverless**: Works 100% in your browser. All data is persisted in `localStorage`. Zero logins or backend servers required.
- **Documents Supported**:
  - **Invoices**: Standard & Tax Invoices (with CGST/SGST or IGST calculation), line items, Indian numbering (`1,00,000`), Amount in Words (`Rupees ... Only`), payment terms, UPI QR code.
  - **Payment Receipts**: Advance / Final payments, transaction ID, UTR tracking, total project cost, amount received, balance remaining, and payment terms notes.
- **Smart Conversions**:
  - **Generate Receipt from Invoice**: Automatically prefills client, project, amounts, and balance due.
- **Strict A4 Visual & Print Precision**:
  - Exact A4 dimensions (210 × 297 mm).
  - Clean multi-page pagination: 25+ item invoices automatically paginate across pages with repeated table headers and exact `Page X of Y` footers.
  - High-resolution (scale 3, 300 DPI) PDF export with native browser engine (`html-to-image` + `jsPDF`) guaranteeing 101% visual parity with live preview.
- **Client & History Management**:
  - Client directory with auto-complete in document forms.
  - Per-client financial totals: Total Billed, Total Received, Balance Pending.
  - History view with filters (Type, Status, Month) and full CSV export.
  - Auto-overdue status detection when due date has passed.
- **Studio Dashboard**:
  - Financial summary: Billed this month, Received this month, Pending due, Overdue count.
  - Minimalist 6-month revenue trend chart (Billed vs. Received).
  - Top clients by revenue.
- **Settings & Business Profile**:
  - Proprietor: **Dev Rajpoot**, Founder & CEO.
  - Udyam Registration No.: **UDYAM-UP-54-0127731**.
  - Customizable number patterns (e.g. `DEV-{YYYY}-{001}`, `DEV-REC-{001}`).
  - Item presets, terms templates, bank and UPI toggles with validation.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Server
```bash
npm run dev
# or for production preview
npm run preview
```
Open your browser at `http://localhost:4173`.

### 3. Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` directory.

---

## Keyboard Shortcuts

- <kbd>Ctrl</kbd> + <kbd>S</kbd> (or <kbd>Cmd</kbd> + <kbd>S</kbd>): Save current document draft.
- <kbd>Ctrl</kbd> + <kbd>P</kbd> (or <kbd>Cmd</kbd> + <kbd>P</kbd>): Download print-ready A4 PDF.

---

## Data Backup and Restore

Your financial data is stored locally in your browser's `localStorage`. To prevent data loss when switching computers or clearing browser caches:

1. **Export Full JSON Backup**:
   - Go to **Settings** in the top navigation.
   - Click **Export JSON** in the Data Safety banner.
   - A timestamped `.json` file containing all documents, clients, and business settings will be saved to your device.
2. **Import / Restore JSON Backup**:
   - In **Settings**, click **Import JSON** and select your backup `.json` file.
   - Confirm the prompt to restore all documents, clients, and settings.
3. **Export CSV**:
   - In **History** or **Settings**, click **Export All CSV** to download a spreadsheet-compatible history of all transactions.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Google Fonts Poppins
- **PDF Generation**: html-to-image (native browser C++ SVG engine) + jsPDF (Scale 3, 300 DPI, lossless PNG)
- **QR Engine**: qrcode (UPI URI standard)
- **Icons & Dates**: lucide-react, date-fns

