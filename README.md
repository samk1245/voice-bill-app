# VoiceBill AI (voice-bill-app)

VoiceBill AI is a modern, simple, and fast mobile-first voice-powered billing and ledger application for local shops and small businesses.

## Key Features

- **Voice Billing**: Create bills/invoices simply by speaking naturally in Hindi, English, or Hinglish (e.g. *"Ramesh ko do kilo chawal, ek kilo cheeni aur paanch biscuit dena"*).
- **Intelligent NLP Parser**: Extracts customer name, products, quantities, units (kg, g, packet, piece, bottle, etc.), discounts, and calculates GST & totals.
- **Smart Ambiguity Resolver**: Prompts the user when a product match is ambiguous (e.g. Parle-G 50g vs Parle-G 100g).
- **Inventory Management**: Add products via voice or manual form, adjust stock, low-stock warnings, barcode scanner simulator.
- **Khata / Udhaar Ledger**: Customer credit tracker, ledger transaction history, payment recordings, and WhatsApp reminder links.
- **AI Sales Assistant**: Query sales insights, top-selling items, and low-stock alerts with interactive charts.
- **Offline Mode**: Works seamlessly offline using client-side NLP and buffers transactions for auto-sync.
- **Multi-Shop & Multi-Role**: Supports multiple store management with Owner and Cashier roles.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Redux Toolkit
- **Backend**: Node.js & Express
- **Database**: Local JSON database fallback (`db_fallback.json`) & Mongoose/MongoDB compatible

## Getting Started

### 1. Start Dev Servers
```bash
# Start backend API (Port 5000)
cd backend
npm install
node server.js

# Start frontend client (Port 5173)
cd frontend
npm install
npm run dev -- --config vite.config.cjs
```
Alternatively, run `start-dev.bat` or `start-dev.ps1` from the project root.
