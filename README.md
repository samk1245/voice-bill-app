# VoiceBill AI 2.0 — Universal AI Billing, POS & Business OS 🚀

[![CI/CD Pipeline](https://github.com/samk1245/voice-bill-app/actions/workflows/ci.yml/badge.svg)](https://github.com/samk1245/voice-bill-app/actions)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**VoiceBill AI** is a state-of-the-art, multilingual AI billing platform and retail POS system engineered for retail counters, kirana stores, pharmacies, restaurants, fashion outlets, salons, and modern businesses. It combines conversational natural-language voice billing with touch POS speed, camera barcode scanning, and deep business analytics.

---

## 🌟 Core Highlights & Features

### 1. 🎙️ Real-Time Multilingual Voice Billing
- **Native Web Speech API Engine**: Zero third-party cloud lock-in. Real-time microphone listening with animated audio waveform visualizer.
- **Hindi, English & Hinglish Speech Processing**:
  - *"Add two chawal at 60 rupees and one mustard oil"*
  - *"Apply 10 percent discount"*
  - *"Set GST to 18 percent"*
  - *"Customer paid 500 cash"* $\rightarrow$ calculates change return instantly.
  - *"Ramesh ne 400 udhaar liya"* $\rightarrow$ logs debt to customer ledger.
- **Zero-Latency Retail Audio Chimes**: Synthesized via the Web Audio API (1850Hz barcode scanner beep, melody cash drawer success chimes, delete sweeps).
- **Speech Synthesis (Voice Talkback)**: Speaks added items and invoice totals back in regional accents.

### 2. 🏢 Universal Business Profiles (12 Pre-Configured Templates)
Switch between 12 industry templates with 1 click to adapt units, taxes, terms, and catalogs:
1. **Kirana & Grocery**: FMCG, weight units (`kg`, `g`, `litre`, `packet`), 30+ everyday grocery essentials.
2. **Clothing & Fashion**: Sizes, colors, apparel, footwear, 7-day exchange policies.
3. **Electronics & Mobile**: Gadgets, IMEI/serial numbers, 1-year brand warranty.
4. **Medical & Pharmacy**: Chemist, batch numbers (`batchNumber`), expiry tracking (`expiryDate`), Schedule H compliance.
5. **Restaurant, Cafe & Bakery**: Dine-in, takeaway, table numbers, kitchen tokens.
6. **Hardware & Electrical**: Length/weight units (`meter`, `kg`, `box`), lighting, tools.
7. **Beauty Salon & Spa**: **Pure service billing (zero physical inventory)**, per-session/hourly pricing.
8. **Automobile & Repair**: Labor & service charges + genuine spare parts split.
9. **Bookstores & Stationery**: Tax-exempt books (`0%`), stationery items (`12-18%`).
10. **Wholesale & Distribution**: Bulk master cartons, sacks, wholesale price tiers, payment terms.
11. **General Retail**: Gift shops, home decor, kitchenware, multi-utility.
12. **Custom Business**: 100% customizable fields, custom units, and tax categories.

### 3. 📷 Live Camera & Webcam Barcode/QR Scanner
- Live camera stream powered by HTML5 `MediaDevices` API with front/rear camera toggle.
- Viewfinder targeting overlay with glowing red animated laser scan beam.
- Automatic hardware `BarcodeDetector` API decoding (EAN-13, EAN-8, UPC, Code 128, QR Code).
- Audio beep and instant auto-addition to the active cart tape.

### 4. 🧾 Day-End Cash Drawer Reconciliation (Z-Report)
- End-of-shift cash drawer audit (*Galla Hisab*):
  - **(+) Opening Cash Balance**
  - **(+) Cash Invoiced Today**
  - **(-) Cash Expenses Paid from Drawer**
  - **(=) Expected Cash in Drawer**
  - Input **Physical Cash Counted** $\rightarrow$ calculates live **Cash Variance** (Surplus/Shortage).
  - 1-click **"Print Z-Report"** shift handover sheet.

### 5. ⭐ Customer Loyalty Points Engine
- Earns 1 loyalty point for every ₹100 spent.
- Entering customer mobile reveals available loyalty points with 1-click instant discount redemption.

### 6. 💬 1-Click WhatsApp Udhaar & Payment Reminder
- In the Customer Directory, click **"WhatsApp Reminder"** next to any debtor to generate a pre-formatted reminder with amount owed and the shop's UPI ID.

### 7. 📊 1-Click CSV Data Exporters
- Deterministic RFC-4180 client-side CSV exports for:
  - **Invoices**: `VoiceBill_Invoices_YYYY-MM-DD.csv`
  - **Product Catalog**: `VoiceBill_Products_YYYY-MM-DD.csv`
  - **Customer Ledgers**: `VoiceBill_Customers_Ledger_YYYY-MM-DD.csv`
  - **Operating Expenses**: `VoiceBill_Expenses_YYYY-MM-DD.csv`

### 8. 🤖 BillMate AI Copilot
Conversational assistant connected to live database records:
- *"How much did I sell today?"* $\rightarrow$ Summarizes today's revenue, bills, and paid status.
- *"Which products generated the most revenue?"* $\rightarrow$ Ranks top revenue products.
- *"Show customers with outstanding payments"* $\rightarrow$ Lists debtors with pending credit amounts.
- *"Check low stock alerts"* $\rightarrow$ Detects inventory items falling below alert threshold.
- *"Log expense 500 for electricity"* $\rightarrow$ Automatically records expense under Utilities.

### 9. 🖨️ Dual Receipt Generation & Dynamic UPI QR Code
- **58mm / 80mm Thermal Slip**: Authentic POS receipt layout with serrated borders and itemized breakdown.
- **A4 GST Tax Invoice**: Full-page printable invoice with CGST/SGST/IGST breakdown.
- **Dynamic BharatQR / UPI Code**: Scannable QR code generated with merchant VPA ID and invoice total.
- **PDF Export**: High-resolution client-side PDF export via `html2canvas` + `jspdf`.

---

## 🗂️ Application Structure (15 Modules)

| # | Module | Description |
|---|---|---|
| **1** | **Dashboard** | Real-time KPIs (Today Sales, Month Sales, Udhaar, Inventory), 7-day sales area chart, top products, recent bills. |
| **2** | **Voice & Fast Bill** | Web Speech API, waveform visualizer, grocery combos, 6-item quick fill, photo shelf, cart tape with item thumbnails. |
| **3** | **Manual POS Grid** | Touch-friendly product grid, category quick filters, fast tender with cash shortcuts. |
| **4** | **Products & Services** | Full catalog CRUD, physical goods vs services (`isService`), batch & expiry for pharmacy, low stock alerts. |
| **5** | **Stock & Inventory** | Stock health KPIs, total inventory valuation, low stock warnings, stock adjustment audit logs. |
| **6** | **Invoices & Receipts** | Complete bill history, payment filters, search, reprint receipts, cancel with automatic stock restoration. |
| **7** | **Quotations & Estimates** | Create formal estimates, validity dates, 1-click **"Convert to Bill"** to load quotation into the active bill tape. |
| **8** | **Customers & Udhaar** | Customer profiles, ledger history, outstanding balances, 1-click **"Record Payment"** modal. |
| **9** | **Suppliers Directory** | Wholesale vendor profiles, contact details, supplied categories, pending payables. |
| **10** | **Expenses & Cashflow** | Operating cost tracker (Rent, Utilities, Salaries, Transport), **Net Operating Profit Calculator**: (Revenue - Expenses). |
| **11** | **Reports & GST** | Tax breakdown for GSTR-1 (CGST, SGST, IGST), payment mode distribution (Cash, UPI, Card, Credit). |
| **12** | **BillMate AI** | Conversational business assistant with live database lookups. |
| **13** | **Staff & Permissions** | Owner, Manager, Cashier, Accountant roles with granular permission matrix. |
| **14** | **Business Settings** | Store identity, GST rules, invoice prefixes, UPI VPA, printer preferences, database backup & restore. |
| **15** | **Help & Shortcuts** | Keyboard shortcuts cheatsheet (`Ctrl+B`, `Ctrl+M`, `Ctrl+K`, `Esc`) and voice phrase guide. |

---

## ⌨️ Counter Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + B` | Switch immediately to Voice & Smart Bill workspace |
| `Ctrl + M` | Switch to Manual Touch POS Grid |
| `Ctrl + K` | Focus Global Product / Customer Search |
| `Ctrl + I` | Open BillMate AI Assistant Copilot |
| `Space` | Toggle Voice Microphone on/off (in billing tab) |
| `Esc` | Close any active modal, scanner, or receipt preview |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (Node.js 20+ recommended)
- **npm** v9+

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/samk1245/voice-bill-app.git
cd voice-bill-app
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
npm start
\`\`\`
*Backend starts on `http://localhost:5001` with an automated local JSON sandbox database (`config/db_fallback.json`).*

### 3. Frontend Setup
\`\`\`bash
cd ../frontend
npm install
npm run dev
\`\`\`
*Frontend opens on `http://localhost:5173` with Vite HMR.*

### 4. Running Unit Tests
\`\`\`bash
cd backend
node --test tests/billing.test.js
\`\`\`

---

## 🔑 Demo Login Credentials
- **Mobile Number**: `9876543210`
- **Default Dev OTP**: `123456`
- **Role**: Store Owner (`Apna Super Bazaar & Kirana`)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
