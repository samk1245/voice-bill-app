import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Sparkles, ArrowRight, CheckCircle2, ChevronRight, 
  Zap, Shield, TrendingUp, Store, FileText, ShoppingCart, 
  Package, Users, BarChart3, CreditCard, ChevronDown, Check,
  QrCode, RefreshCw, Star, Layers, Play, Volume2, Globe, Heart
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Interactive Voice Billing Demo State
  const [demoCommand, setDemoCommand] = useState('Add 2 shirts at ₹750 each and 1 perfume at ₹1200');
  const [demoIsSimulating, setDemoIsSimulating] = useState(false);
  const [demoDiscount, setDemoDiscount] = useState(10);
  const [demoTaxRate, setDemoTaxRate] = useState(18);
  const [demoItems, setDemoItems] = useState([
    { id: 1, name: 'Cotton Casual Shirt', qty: 2, price: 750, total: 1500 },
    { id: 2, name: 'French Eau De Parfum', qty: 1, price: 1200, total: 1200 }
  ]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Quick Simulation Prompts
  const samplePrompts = [
    'Add 2 shirts at ₹750 each and 1 perfume at ₹1200',
    'Add 5kg Basmati Rice at ₹90 per kg and 2 packets Ghee at ₹550',
    'Add 1 Mobile Phone at ₹14999 and Apply 10% discount',
    'Add 3 Notebooks at ₹60 each and 5 Ball Pens at ₹10 each'
  ];

  const runSimulation = (text) => {
    setDemoCommand(text);
    setDemoIsSimulating(true);

    setTimeout(() => {
      if (text.includes('Rice')) {
        setDemoItems([
          { id: 1, name: 'Basmati Rice Premium (1kg)', qty: 5, price: 90, total: 450 },
          { id: 2, name: 'Pure Cow Ghee (1L)', qty: 2, price: 550, total: 1100 }
        ]);
        setDemoTaxRate(5);
        setDemoDiscount(0);
      } else if (text.includes('Mobile')) {
        setDemoItems([
          { id: 1, name: 'Samsung Galaxy A15 5G', qty: 1, price: 14999, total: 14999 }
        ]);
        setDemoTaxRate(18);
        setDemoDiscount(10);
      } else if (text.includes('Notebook')) {
        setDemoItems([
          { id: 1, name: 'Classmate Spiral Notebook', qty: 3, price: 60, total: 180 },
          { id: 2, name: 'Gel Ink Ball Pen Blue', qty: 5, price: 10, total: 50 }
        ]);
        setDemoTaxRate(12);
        setDemoDiscount(5);
      } else {
        setDemoItems([
          { id: 1, name: 'Cotton Casual Shirt', qty: 2, price: 750, total: 1500 },
          { id: 2, name: 'French Eau De Parfum', qty: 1, price: 1200, total: 1200 }
        ]);
        setDemoTaxRate(18);
        setDemoDiscount(10);
      }
      setDemoIsSimulating(false);
    }, 600);
  };

  // Calculations for Demo
  const subtotal = demoItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmt = Math.round((subtotal * (demoDiscount / 100)) * 100) / 100;
  const taxableAmt = subtotal - discountAmt;
  const taxAmt = Math.round((taxableAmt * (demoTaxRate / 100)) * 100) / 100;
  const grandTotal = Math.round((taxableAmt + taxAmt) * 100) / 100;

  const faqs = [
    {
      q: 'How does Voice Billing work in noisy retail shops?',
      a: 'VoiceBill AI utilizes adaptive Web Speech AI and noise-filtration thresholds. It matches speech phonetically against your pre-loaded product catalog, so even short local phrases like "do packet maggi aur ek kilo cheeni" are detected accurately without manual typing.'
    },
    {
      q: 'Does it support Indian GST and Tax compliance (CGST/SGST/IGST)?',
      a: 'Yes, fully. VoiceBill AI includes dedicated HSN/SAC code management, configurable 0%, 5%, 12%, 18%, and 28% tax slabs, automated intra-state (CGST + SGST) and inter-state (IGST) calculations, and B2B/B2C compliant invoice printing.'
    },
    {
      q: 'Can I use VoiceBill AI for non-grocery stores like fashion or electronics?',
      a: 'Absolutely! VoiceBill AI includes 12 instant business profile templates: Clothing & Footwear, Electronics, Pharmacy, Restaurants & Cafes, Hardware, Beauty Salons, Automobile, Bookstores, Wholesale, and General Retail.'
    },
    {
      q: 'Can customers pay via UPI QR code directly on the printed or shared bill?',
      a: 'Yes. VoiceBill AI generates dynamic UPI QR codes containing your merchant VPA and exact invoice amount. Customers can scan with Google Pay, PhonePe, or Paytm and pay instantly.'
    },
    {
      q: 'Does VoiceBill AI work on tablets and mobile phones?',
      a: 'Yes, the interface is 100% responsive and optimized for mobile devices, iPad/tablets, and desktop POS cash drawers with thermal 80mm/58mm printing.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-fuchsia-600/15 rounded-full blur-[150px]" />
      </div>

      {/* 1. Header Navigation */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-slate-950/80 sticky top-0 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Mic className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                VoiceBill <span className="text-violet-400">AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">v2.5</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#demo" className="hover:text-white transition">Live Voice Demo</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md animate-pulse">
          <Zap className="h-4 w-4 text-cyan-400" />
          <span>Next-Gen Voice-Activated Universal Billing & POS Platform</span>
          <ChevronRight className="h-3.5 w-3.5 text-violet-400" />
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
          <span className="text-white">Your Voice. Your Business.</span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
            Your Billing, Automated.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Meet the smarter way to manage invoices, customers, payments and business insights — powered by AI and your voice. Built for Kirana, retail stores, fashion boutiques, cafes, and modern enterprises.
        </p>

        {/* Hero CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white shadow-xl shadow-violet-600/40 hover:shadow-violet-600/60 hover:scale-[1.03] active:scale-[0.98] transition flex items-center justify-center gap-3 group"
          >
            <span>Start Billing Smarter</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl text-base font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 text-violet-400" />
            <span>Interactive Demo</span>
          </a>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">92%</div>
            <div className="text-xs text-slate-400 mt-1">Faster Checkout Speed</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">0%</div>
            <div className="text-xs text-slate-400 mt-1">Calculation Errors</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">12+</div>
            <div className="text-xs text-slate-400 mt-1">Industry Profiles</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">₹45k+</div>
            <div className="text-xs text-slate-400 mt-1">Avg Monthly Savings</div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Voice Billing Simulator */}
      <section id="demo" className="relative z-10 py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Interactive AI Playground
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Experience Voice Billing Live
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base mt-2">
            Click any retail voice command below to see VoiceBill AI extract items, calculate taxes & generate formatted invoices instantly.
          </p>
        </div>

        {/* Simulator Container */}
        <div className="rounded-3xl bg-slate-900/90 border border-violet-500/30 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-violet-950/50">
          {/* Sample Prompts Chips */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => runSimulation(p)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                  demoCommand === p 
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <Mic className="h-3 w-3 text-cyan-400" />
                <span>{p}</span>
              </button>
            ))}
          </div>

          {/* Voice Input Display */}
          <div className="relative mb-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/80 border border-white/10">
              <div className={`p-3 rounded-xl shrink-0 ${
                demoIsSimulating 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-violet-600 text-white'
              }`}>
                {demoIsSimulating ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Live Spoken Command
                </div>
                <div className="text-sm sm:text-base font-semibold text-white truncate">
                  "{demoCommand}"
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Parsed</span>
              </div>
            </div>
          </div>

          {/* Live Generated Invoice Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Cart Table */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-950/50 border border-white/10 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Item & Description</span>
                <div className="flex items-center gap-8">
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Total</span>
                </div>
              </div>
              <div className="divide-y divide-white/5 mt-2">
                {demoItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="font-semibold text-slate-200">{item.name}</div>
                    <div className="flex items-center gap-8">
                      <span className="text-slate-400">{item.qty}</span>
                      <span className="text-slate-400">₹{item.price}</span>
                      <span className="font-bold text-white">₹{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Calculation Engine Card */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-950/60 to-slate-950/80 border border-violet-500/30 p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-3">
                  Real-Time Calculation Engine
                </h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Discount ({demoDiscount}%)</span>
                    <span>-₹{discountAmt.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST ({demoTaxRate}%)</span>
                    <span className="font-medium text-slate-200">+₹{taxAmt.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Grand Total</span>
                    <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Ready to Print / WhatsApp
                </span>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Open Full POS</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 6-Pillar Feature Showcase */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3">
            Everything Your Business Needs to Thrive
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base mt-3">
            Designed for high transaction speed, 100% tax accuracy, and effortless multi-business operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/50 transition group hover:shadow-xl hover:shadow-violet-950/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-violet-600/30 group-hover:scale-110 transition-transform">
              <Mic className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multilingual Voice Billing</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Speak in Hindi, English, or Hinglish. Automatically parses items, prices, decimal weights, discounts, and customer names in one single command.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-500/50 transition group hover:shadow-xl hover:shadow-cyan-950/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-600/30 group-hover:scale-110 transition-transform">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">12 Universal Business Profiles</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Instant catalog seed templates for Kirana & Grocery, Clothing, Electronics, Pharmacies, Restaurants, Salons, Hardware, Automobile, and Wholesale.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-fuchsia-500/20 hover:border-fuchsia-500/50 transition group hover:shadow-xl hover:shadow-fuchsia-950/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-rose-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-fuchsia-600/30 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">BillMate AI Business Copilot</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Ask natural questions like "How much did I sell today?", "Who has not paid me?", or "Predict next month's revenue". Powered by actual store database insights.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/50 transition group hover:shadow-xl hover:shadow-emerald-950/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated GST & Compliance</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Configurable CGST, SGST, IGST tax computations, HSN/SAC code tracking, customizable invoice prefixes (`VB-`), and thermal 80mm/58mm printing.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/50 transition group hover:shadow-xl hover:shadow-amber-950/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Customer CRM & Udhaar Khata</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Track customer lifetime value, outstanding credit balances, loyalty points, and send 1-click WhatsApp payment reminders with dynamic UPI links.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/20 hover:border-indigo-500/50 transition group hover:shadow-xl hover:shadow-indigo-950/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Camera Barcode Scanner</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Scan product barcodes directly using your laptop or smartphone camera with native red laser guide, front/rear camera switcher, and audio scan chime.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works (3-Step Interactive Flow) */}
      <section id="how-it-works" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Lightning-Fast Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            From Spoken Words to Settled Cash in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 rounded-3xl bg-slate-900/60 border border-white/10">
            <div className="text-4xl font-black text-violet-500/30 mb-4">01</div>
            <h3 className="text-xl font-bold text-white mb-2">Speak, Scan or Click</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Press the microphone button and speak naturally, scan barcodes via webcam, or tap items from the visual POS grid.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-slate-900/60 border border-white/10">
            <div className="text-4xl font-black text-fuchsia-500/30 mb-4">02</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Computes & Verifies</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              VoiceBill AI cross-references inventory, applies GST/discounts, checks customer loyalty, and computes grand totals accurately.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-slate-900/60 border border-white/10">
            <div className="text-4xl font-black text-cyan-500/30 mb-4">03</div>
            <h3 className="text-xl font-bold text-white mb-2">Print, WhatsApp & Settle</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Print a 80mm thermal receipt, share via WhatsApp with instant UPI QR, and close your day with an automated Z-Report reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Pricing Plans */}
      <section id="pricing" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/20">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Choose the Perfect Plan for Your Shop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-white mb-1">Starter</div>
              <div className="text-xs text-slate-400 mb-6">For single-counter shops & kiosks</div>
              <div className="text-4xl font-extrabold text-white mb-6">₹0 <span className="text-sm font-normal text-slate-400">/forever</span></div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Up to 200 bills / month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Voice billing in Hindi & English</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Product catalog management</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Standard thermal print</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition text-center"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro AI Plan (Highlighted) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-violet-900/60 to-slate-900/90 border-2 border-violet-500 relative flex flex-col justify-between shadow-2xl shadow-violet-950/60">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[11px] font-extrabold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="text-lg font-bold text-white mb-1">Pro AI Copilot</div>
              <div className="text-xs text-violet-300 mb-6">For growing retailers & supermarkets</div>
              <div className="text-4xl font-extrabold text-white mb-6">₹799 <span className="text-sm font-normal text-slate-400">/month</span></div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0" /> Unlimited invoices & POS tickets</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0" /> Full BillMate AI business assistant</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0" /> Live camera barcode scanning</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0" /> WhatsApp payment reminders & UPI QR</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0" /> Day-End cash drawer reconciliation</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0" /> 1-Click CSV & database backups</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white text-xs font-bold transition text-center shadow-lg shadow-violet-600/40 hover:scale-[1.02]"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-white mb-1">Enterprise</div>
              <div className="text-xs text-slate-400 mb-6">For multi-store chains & wholesale distributors</div>
              <div className="text-4xl font-extrabold text-white mb-6">₹1,999 <span className="text-sm font-normal text-slate-400">/month</span></div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Multi-branch centralized inventory</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Custom GSTIN prefixes & branches</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Role-based staff access controls</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Dedicated account manager & 24/7 support</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition text-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-violet-300 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-violet-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="relative z-10 py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-violet-900/80 via-fuchsia-900/80 to-cyan-900/80 border border-violet-500/40 backdrop-blur-xl shadow-2xl shadow-violet-950/80">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Ready to Transform Your Retail Billing?
          </h2>
          <p className="text-violet-200 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Join thousands of modern shop owners saving hours daily with VoiceBill AI.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-white text-slate-950 shadow-xl hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.98] transition group"
          >
            <span>Start Billing Smarter Now</span>
            <ArrowRight className="h-5 w-5 text-violet-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 9. Futuristic SaaS Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-sm">
              V
            </div>
            <div>
              <div className="font-bold text-slate-200 text-sm">VoiceBill AI Platform</div>
              <div className="text-[11px] text-slate-400">Universal AI Billing, POS & Business Intelligence</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition">Features</a>
            <a href="#demo" className="hover:text-slate-300 transition">Voice Demo</a>
            <a href="#pricing" className="hover:text-slate-300 transition">Pricing</a>
            <Link to="/login" className="hover:text-slate-300 transition">Sign In</Link>
          </div>

          <div className="text-center md:text-right">
            <div>© {new Date().getFullYear()} VoiceBill AI. All rights reserved.</div>
            <div className="text-[10px] text-slate-600 mt-1">Built with precision for retail & enterprise speed.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
