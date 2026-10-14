# VoiceBill AI (voice-bill-app) 🚀

VoiceBill AI is a modern, simple, and fast mobile-first and desktop POS voice-powered billing and ledger application for local shops and small businesses.

---

## 🌟 Advanced Features (v2.0 Upgrade)

### 1. Dual Interface: Mobile Shell & Counter POS Widescreen Mode
- **📱 Mobile App View**: Simulated phone interface with realistic status bar, notch, and navigation.
- **🖥️ Desktop / Tablet POS Counter**: Full widescreen 3-column retail billing counter (Voice Assistant + Quick Touch Product Bar on left, Live Cart & Financials in center, Customer Ledger & Inventory on right).

### 2. Real Web Speech Recognition & Audio Wave Visualizer
- Powered by native browser `SpeechRecognition` / `webkitSpeechRecognition` with real-time waveform animation.
- Multilingual speech-to-text in **Hindi, English, and Hinglish**.

### 3. Voice Talkback (TTS) & Retail POS Audio Feedback
- **Speech Synthesis (TTS)**: VoiceBill speaks back in Indian Hindi/English to confirm added items, total bill, or cash change (e.g. *"2 kilo chawal bill mein add ho gaya. Total bill ₹150"*).
- **Zero-Latency Retail Sound Effects**: Crisp 1800Hz barcode scanner beeps, cash drawer completion chimes, and delete sweeps synthesized directly via Web Audio API.

### 4. Conversational Voice Commands & Multi-Turn Editing
- **Add Items**: *"Ramesh ko do kilo chawal aur teen packet biscuit dena"*
- **Item Removal**: *"Chawal hata do"*, *"Maggi remove karo"*
- **Quantity Update**: *"Chawal 3 kilo kar do"*, *"Maggi 5 packet kar do"*
- **Discounts**: *"10 rupaye discount laga do"*
- **Cash & Change Calculation**: *"Customer ne 500 cash diya"* -> automatically computes change.
- **Credit / Udhaar**: *"Ramesh ne 1000 rupaye udhaar liye"* -> updates ledger.
- **Voice Actions**: *"Bill confirm karo"*, *"Invoice print karo"*, *"WhatsApp par bhejo"*.

### 5. Smart Ambiguity Resolver
- Automatically pauses and presents interactive choices when a voice query matches multiple product sizes (e.g. *"Parle-G add karo"* prompts between *Parle-G 50g (₹5)* and *Parle-G 100g (₹10)*).

### 6. Thermal POS Receipt & Dynamic UPI QR Code
- **🧾 58mm / 80mm Thermal Slip**: Authentic supermarket receipt styling with serrated edges, item breakdown, and barcode.
- **📄 GST Tax Invoice**: Standard A4 invoice format.
- **📱 Scan & Pay UPI QR Code**: Dynamic QR code encoding store UPI ID, customer name, and bill amount (`upi://pay?pa=...`).
- **One-Click WhatsApp Sharing**: Instant pre-composed bill share link.

### 7. Fast Touch POS Keypad
- Quick 1-tap addition for daily grocery staples (Basmati Rice, Sugar, Aata, Maggi, Coca Cola, Parle-G, Tata Salt, Dettol Soap).

### 8. Customer Khata & WhatsApp Payment Reminders
- Customer credit ledger tracking pending balances and historical payments.
- One-click formatted WhatsApp payment reminders with shop UPI ID.

### 9. AI Sales Assistant
- Conversational analytics: *"Aaj ki sale kitni hui?"*, *"Is hafte sabse zyada kya bika?"*, *"Kaunsa product stock mein kam hai?"*.
- Dynamic charts and business metrics powered by Recharts.

### 10. Offline-First Mode
- Full client-side NLP fallback (`nlpParser.js`) and local storage queueing. Works seamlessly with zero internet and synchronizes automatically when reconnected.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Redux Toolkit
- **Backend**: Node.js, Express, Helmet, CORS, JWT Auth
- **Database**: Local JSON database fallback (`db_fallback.json`) & MongoDB / Mongoose support
- **Audio & Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + Web Audio API synthesizer

---

## 🚀 How to Run Locally

### Option 1: Quick Launcher (Windows)
Double-click `start-dev.bat` or run:
```powershell
.\start-dev.ps1
```

### Option 2: Manual Start
```bash
# 1. Start Backend API (Port 5000)
cd backend
npm install
node server.js

# 2. Start Frontend Client (Port 5173)
cd frontend
npm install
npm run dev -- --config vite.config.cjs
```
Open **`http://localhost:5173`** in your browser.
