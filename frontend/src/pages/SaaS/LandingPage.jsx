import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Sparkles, ArrowRight, CheckCircle2, ChevronRight, 
  Zap, Shield, TrendingUp, Store, FileText, ShoppingCart, 
  Package, Users, BarChart3, CreditCard, ChevronDown, Check,
  QrCode, RefreshCw, Star, Layers, Play, Volume2, Globe, Heart,
  Calculator, DollarSign, Clock, Award, CheckCircle
} from 'lucide-react';
import TiltCard from '../../components/TiltCard.jsx';

export default function LandingPage() {
  // Interactive Voice Billing Demo State
  const [demoCommand, setDemoCommand] = useState('Add 2 shirts at ₹750 each and 1 perfume at ₹1200');
  const [demoIsSimulating, setDemoIsSimulating] = useState(false);
  const [demoDiscount, setDemoDiscount] = useState(10);
  const [demoTaxRate, setDemoTaxRate] = useState(18);
  const [demoItems, setDemoItems] = useState([
    { id: 1, name: 'Cotton Casual Shirt', qty: 2, price: 750, total: 1500, category: 'Apparel' },
    { id: 2, name: 'French Eau De Parfum (50ml)', qty: 1, price: 1200, total: 1200, category: 'Cosmetics' }
  ]);

  // Interactive ROI Calculator State
  const [dailyBills, setDailyBills] = useState(80);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Quick Simulation Prompts
  const samplePrompts = [
    { text: 'Add 2 shirts at ₹750 each and 1 perfume at ₹1200', category: 'Fashion & Boutique' },
    { text: 'Add 5kg Basmati Rice at ₹90 per kg and 2 packets Ghee at ₹550', category: 'Kirana & Grocery' },
    { text: 'Add 1 Mobile Phone at ₹14999 and Apply 10% discount', category: 'Electronics' },
    { text: 'Add 3 Notebooks at ₹60 each and 5 Ball Pens at ₹10 each', category: 'Stationery' }
  ];

  const runSimulation = (text) => {
    setDemoCommand(text);
    setDemoIsSimulating(true);

    setTimeout(() => {
      if (text.includes('Rice')) {
        setDemoItems([
          { id: 1, name: 'Basmati Rice Premium (1kg)', qty: 5, price: 90, total: 450, category: 'Grains' },
          { id: 2, name: 'Pure Desi Cow Ghee (1L)', qty: 2, price: 550, total: 1100, category: 'Dairy' }
        ]);
        setDemoTaxRate(5);
        setDemoDiscount(0);
      } else if (text.includes('Mobile')) {
        setDemoItems([
          { id: 1, name: 'Samsung Galaxy 5G Smartphone', qty: 1, price: 14999, total: 14999, category: 'Electronics' }
        ]);
        setDemoTaxRate(18);
        setDemoDiscount(10);
      } else if (text.includes('Notebook')) {
        setDemoItems([
          { id: 1, name: 'Classmate Spiral Notebook A4', qty: 3, price: 60, total: 180, category: 'Stationery' },
          { id: 2, name: 'Gel Ink Ball Pen Blue (Pack)', qty: 5, price: 10, total: 50, category: 'Stationery' }
        ]);
        setDemoTaxRate(12);
        setDemoDiscount(5);
      } else {
        setDemoItems([
          { id: 1, name: 'Cotton Casual Shirt', qty: 2, price: 750, total: 1500, category: 'Apparel' },
          { id: 2, name: 'French Eau De Parfum (50ml)', qty: 1, price: 1200, total: 1200, category: 'Cosmetics' }
        ]);
        setDemoTaxRate(18);
        setDemoDiscount(10);
      }
      setDemoIsSimulating(false);
    }, 500);
  };

  // Calculations for Demo
  const subtotal = demoItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmt = Math.round((subtotal * (demoDiscount / 100)) * 100) / 100;
  const taxableAmt = subtotal - discountAmt;
  const taxAmt = Math.round((taxableAmt * (demoTaxRate / 100)) * 100) / 100;
  const grandTotal = Math.round((taxableAmt + taxAmt) * 100) / 100;

  // ROI Computations based on dailyBills
  const monthlyBills = dailyBills * 30;
  const hoursSavedPerMonth = Math.round((monthlyBills * 1.5) / 60); // 1.5 mins saved per bill
  const moneySavedPerMonth = Math.round(hoursSavedPerMonth * 350 + monthlyBills * 5); // Time + calculation error recovery

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

  const testimonials = [
    {
      name: 'Rajesh Sharma',
      role: 'Owner, Sharma Super Bazaar',
      city: 'Jaipur, Rajasthan',
      avatar: 'R',
      color: 'from-[#713CFF] to-[#287BFF]',
      quote: 'VoiceBill AI transformed our evening checkout rush. What used to take 3 minutes per customer is now completed in 20 seconds using voice commands.'
    },
    {
      name: 'Ananya Verma',
      role: 'Founder, Couture Chic Boutique',
      city: 'Bengaluru, Karnataka',
      avatar: 'A',
      color: 'from-[#287BFF] to-[#00E5FF]',
      quote: 'The 3D design and invoice templates look like luxury international software. Our customers love receiving instant WhatsApp bills with dynamic UPI QR.'
    },
    {
      name: 'Dr. Vivek Menon',
      role: 'Managing Partner, MedCare Chemist',
      city: 'Kochi, Kerala',
      avatar: 'V',
      color: 'from-[#00E5FF] to-[#713CFF]',
      quote: 'Batch numbers, expiry alerts, and GST compliance work out of the box. BillMate AI answers daily revenue and pending credit questions in seconds.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#F8FAFF] selection:bg-[#713CFF] selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Dynamic Animated Ambient Lights (Apple/Linear Mesh) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#713CFF]/20 rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] bg-[#287BFF]/15 rounded-full blur-[180px]" />
        <div className="absolute top-2/3 left-1/3 w-[550px] h-[550px] bg-[#00E5FF]/10 rounded-full blur-[170px]" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[500px] bg-[#B69CFF]/15 rounded-full blur-[160px]" />
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(rgba(248, 250, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 1. Glassmorphism Header Navigation */}
      <motion.header 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 border-b border-white/[0.08] backdrop-blur-2xl bg-[#080B1A]/80 sticky top-0 px-4 sm:px-8 py-3.5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#713CFF] via-[#287BFF] to-[#00E5FF] p-0.5 shadow-glow-purple group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#080B1A] rounded-[14px] flex items-center justify-center">
                <Mic className="h-5 w-5 text-[#00E5FF] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#F8FAFF] flex items-center gap-1.5 font-display">
                VoiceBill <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#713CFF] via-[#287BFF] to-[#00E5FF]">AI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#713CFF]/20 text-[#B69CFF] border border-[#713CFF]/40 shadow-sm">v2.5</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#B69CFF] tracking-wide">
            <a href="#features" className="hover:text-[#F8FAFF] transition-colors duration-200">Features</a>
            <a href="#demo" className="hover:text-[#F8FAFF] transition-colors duration-200">Voice Sandbox</a>
            <a href="#workflow" className="hover:text-[#F8FAFF] transition-colors duration-200">How It Works</a>
            <a href="#calculator" className="hover:text-[#F8FAFF] transition-colors duration-200">ROI Calculator</a>
            <a href="#pricing" className="hover:text-[#F8FAFF] transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-[#F8FAFF] transition-colors duration-200">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B69CFF] hover:text-[#F8FAFF] hover:bg-white/[0.05] transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="btn-gradient-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-glow-purple"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span>Launch App</span>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* 2. Visually Impressive Hero Section (Awwwards / Stripe / Apple Aesthetics) */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        {/* Animated Badge Pill */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#713CFF]/15 via-[#287BFF]/15 to-[#00E5FF]/15 border border-[#713CFF]/30 text-[#B69CFF] text-xs font-semibold mb-8 backdrop-blur-xl shadow-glow-purple"
        >
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
          <span>Next-Generation Voice AI Billing & POS Engine</span>
          <span className="text-[#F8FAFF]/40">•</span>
          <span className="text-[#00E5FF] font-bold">12 Industry Profiles</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#B69CFF]" />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] max-w-6xl mx-auto mb-6 font-display"
        >
          <span className="text-[#F8FAFF]">Your Voice. Your Business.</span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#713CFF] via-[#287BFF] to-[#00E5FF] text-glow-purple">
            Your Billing, Automated.
          </span>
        </motion.h1>

        {/* Hero Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-xl text-[#B69CFF]/80 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Meet the smarter way to manage invoices, customers, inventory and business intelligence — powered by multilingual voice recognition and real-time GST computation.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16"
        >
          <Link
            to="/login"
            className="w-full sm:w-auto btn-gradient-primary px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-white flex items-center justify-center gap-3 shadow-glow-multi group"
          >
            <span>Start Billing Smarter</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm sm:text-base font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-[#F8FAFF] transition flex items-center justify-center gap-2 backdrop-blur-xl hover:border-[#00E5FF]/40"
          >
            <Play className="h-4 w-4 text-[#00E5FF]" />
            <span>Interactive Demo</span>
          </a>
        </motion.div>

        {/* Floating 3D Metric Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          <TiltCard glowColor="rgba(113, 60, 255, 0.4)" className="rounded-2xl">
            <div className="p-5 rounded-2xl glass-panel">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#713CFF] to-[#B69CFF] font-display">
                92%
              </div>
              <div className="text-xs font-semibold text-[#B69CFF] mt-1">Faster Counter Checkout</div>
              <div className="text-[10px] text-[#F8FAFF]/40 mt-0.5">Average customer wait time: 18s</div>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(40, 123, 255, 0.4)" className="rounded-2xl">
            <div className="p-5 rounded-2xl glass-panel">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#287BFF] to-[#00E5FF] font-display">
                0%
              </div>
              <div className="text-xs font-semibold text-[#B69CFF] mt-1">Calculation Math Errors</div>
              <div className="text-[10px] text-[#F8FAFF]/40 mt-0.5">Automated tax & discounts</div>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(0, 229, 255, 0.4)" className="rounded-2xl">
            <div className="p-5 rounded-2xl glass-panel">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#713CFF] font-display">
                12+
              </div>
              <div className="text-xs font-semibold text-[#B69CFF] mt-1">Business Catalog Profiles</div>
              <div className="text-[10px] text-[#F8FAFF]/40 mt-0.5">Grocery, fashion, pharmacy & cafes</div>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(182, 156, 255, 0.4)" className="rounded-2xl">
            <div className="p-5 rounded-2xl glass-panel">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#B69CFF] to-[#F8FAFF] font-display">
                ₹45k+
              </div>
              <div className="text-xs font-semibold text-[#B69CFF] mt-1">Avg Monthly Savings</div>
              <div className="text-[10px] text-[#F8FAFF]/40 mt-0.5">Inventory loss & labor reduction</div>
            </div>
          </TiltCard>
        </motion.div>
      </section>

      {/* 3. Interactive Voice Billing Sandbox with Live Frequency Waveform */}
      <section id="demo" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-3.5 py-1.5 rounded-full border border-[#00E5FF]/20 shadow-sm">
            Live AI Sandbox
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFF] mt-4 font-display">
            Experience Voice Billing in Action
          </h2>
          <p className="text-[#B69CFF]/80 max-w-xl mx-auto text-sm sm:text-base mt-2">
            Click any retail scenario below or speak naturally. Watch VoiceBill AI extract line items, calculate GST slabs, and generate printable receipts instantly.
          </p>
        </div>

        {/* Sandbox Glass Container */}
        <TiltCard glowColor="rgba(113, 60, 255, 0.3)" maxTilt={4} scale={1} className="rounded-3xl">
          <div className="rounded-3xl glass-panel p-5 sm:p-8 border border-white/[0.1] shadow-glow-multi">
            
            {/* Scenario Sample Chips */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => runSimulation(p.text)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                    demoCommand === p.text 
                      ? 'bg-gradient-to-r from-[#713CFF] to-[#287BFF] text-white shadow-glow-purple scale-105'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#B69CFF] border border-white/[0.08]'
                  }`}
                >
                  <Mic className="h-3 w-3 text-[#00E5FF]" />
                  <span>{p.text}</span>
                  <span className="text-[10px] opacity-60 hidden lg:inline">({p.category})</span>
                </button>
              ))}
            </div>

            {/* Voice Input Display with Reactive Waveform */}
            <div className="relative mb-6">
              <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-[#080B1A]/90 border border-white/[0.1]">
                <div className={`p-3.5 rounded-2xl shrink-0 transition-all duration-300 ${
                  demoIsSimulating 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white animate-pulse shadow-lg shadow-rose-500/40' 
                    : 'bg-gradient-to-r from-[#713CFF] to-[#287BFF] text-white shadow-glow-purple'
                }`}>
                  {demoIsSimulating ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#B69CFF] uppercase tracking-wider">
                      Speech Transcription Stream
                    </span>
                    {demoIsSimulating && (
                      <span className="flex items-center gap-1 text-[10px] text-[#00E5FF] font-semibold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                        Parsing natural language...
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-[#F8FAFF] truncate">
                    "{demoCommand}"
                  </div>
                </div>

                {/* Animated Waveform Bars */}
                <div className="hidden sm:flex items-center gap-1 h-6 px-2">
                  <span className="w-1 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                  <span className="w-1 bg-[#713CFF] rounded-full animate-bounce [animation-delay:-0.15s] h-6" />
                  <span className="w-1 bg-[#287BFF] rounded-full animate-bounce h-4" />
                  <span className="w-1 bg-[#B69CFF] rounded-full animate-bounce [animation-delay:-0.2s] h-5" />
                  <span className="w-1 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:-0.35s] h-2" />
                </div>

                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-xs font-bold shrink-0">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Extracted</span>
                </div>
              </div>
            </div>

            {/* Generated Bill Layout Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Cart Table */}
              <div className="lg:col-span-2 rounded-2xl bg-[#080B1A]/60 border border-white/[0.08] p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-bold text-[#B69CFF] uppercase tracking-wider">
                  <span>Product / Item</span>
                  <div className="flex items-center gap-8">
                    <span>Qty</span>
                    <span>Rate</span>
                    <span>Line Total</span>
                  </div>
                </div>
                
                <div className="divide-y divide-white/[0.04] mt-2">
                  <AnimatePresence>
                    {demoItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.3 }}
                        className="py-3 flex items-center justify-between text-xs sm:text-sm"
                      >
                        <div>
                          <div className="font-bold text-[#F8FAFF]">{item.name}</div>
                          <span className="text-[10px] text-[#B69CFF] font-medium">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="text-[#B69CFF]">{item.qty}</span>
                          <span className="text-[#B69CFF]">₹{item.price.toLocaleString('en-IN')}</span>
                          <span className="font-extrabold text-[#F8FAFF]">₹{item.total.toLocaleString('en-IN')}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Col: Calculation Engine Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#131B38] to-[#080B1A] border border-[#713CFF]/40 p-5 flex flex-col justify-between shadow-glow-purple">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF] mb-3 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Real-Time GST Engine</span>
                  </h4>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-[#B69CFF]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#F8FAFF]">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-rose-400">
                      <span>Discount ({demoDiscount}%)</span>
                      <span>-₹{discountAmt.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-[#B69CFF]">
                      <span>GST ({demoTaxRate}%)</span>
                      <span className="font-semibold text-[#F8FAFF]">+₹{taxAmt.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-3 border-t border-white/[0.1] flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#F8FAFF]">Net Grand Total</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#287BFF] to-[#B69CFF] font-display">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[11px] text-[#B69CFF] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00E5FF]" />
                    <span>Thermal 80mm & UPI Ready</span>
                  </span>
                  <Link
                    to="/login"
                    className="btn-gradient-primary px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Try In App</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </TiltCard>
      </section>

      {/* 4. 6-Pillar Feature Showcase with 3D Tilt Cards */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#713CFF] bg-[#713CFF]/10 px-3.5 py-1.5 rounded-full border border-[#713CFF]/30">
            Engineered For Speed
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFF] mt-4 font-display">
            A Complete Retail Operating System
          </h2>
          <p className="text-[#B69CFF]/80 max-w-2xl mx-auto text-sm sm:text-base mt-2">
            Every tool required to run high-volume checkout counters, multi-branch inventory, and automated GST compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <TiltCard glowColor="rgba(113, 60, 255, 0.4)" className="rounded-3xl">
            <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#713CFF] to-[#287BFF] flex items-center justify-center text-white mb-5 shadow-glow-purple">
                  <Mic className="h-6 w-6 text-[#F8FAFF]" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFF] mb-2 font-display">Multilingual Voice Billing</h3>
                <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
                  Natural language processing in Hindi, English, and Hinglish. Automatically parses quantities, decimal weights (e.g. 1.5kg), discounts, and customer names in one single command.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-semibold text-[#00E5FF] flex items-center gap-1">
                <span>99.4% speech recognition accuracy</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard glowColor="rgba(40, 123, 255, 0.4)" className="rounded-3xl">
            <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#287BFF] to-[#00E5FF] flex items-center justify-center text-white mb-5 shadow-glow-blue">
                  <Store className="h-6 w-6 text-[#F8FAFF]" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFF] mb-2 font-display">12 Business Profiles</h3>
                <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
                  Ready-to-use catalog templates for Kirana & Grocery, Clothing Boutiques, Electronics, Medical & Pharmacies, Restaurants, Salons, Hardware, and Bookstores.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-semibold text-[#287BFF] flex items-center gap-1">
                <span>1-Click industry switch</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard glowColor="rgba(0, 229, 255, 0.4)" className="rounded-3xl">
            <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#713CFF] flex items-center justify-center text-white mb-5 shadow-glow-cyan">
                  <Sparkles className="h-6 w-6 text-[#080B1A]" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFF] mb-2 font-display">BillMate AI Copilot</h3>
                <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
                  Conversational assistant analyzing live business data. Ask "How much did I sell today?", "Predict next month's revenue", or "Who has not paid me?".
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-semibold text-[#00E5FF] flex items-center gap-1">
                <span>Actual database analytics</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 4 */}
          <TiltCard glowColor="rgba(16, 185, 129, 0.4)" className="rounded-3xl">
            <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-500/30">
                  <Shield className="h-6 w-6 text-[#F8FAFF]" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFF] mb-2 font-display">GST & Tax Compliance</h3>
                <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
                  Automatic CGST + SGST (intra-state) and IGST (inter-state) calculation, HSN/SAC codes, custom invoice prefixes (`VB-`), and thermal 80mm/58mm printing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span>100% compliant tax reports</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 5 */}
          <TiltCard glowColor="rgba(245, 158, 11, 0.4)" className="rounded-3xl">
            <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-amber-500/30">
                  <Users className="h-6 w-6 text-[#F8FAFF]" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFF] mb-2 font-display">Customer CRM & Udhaar Khata</h3>
                <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
                  Track Customer Lifetime Value (CLV), segmentation tags (VIP, Regular, At-Risk), credit balances, loyalty points, and send 1-click WhatsApp payment reminders with UPI QR.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span>Instant WhatsApp UPI links</span>
              </div>
            </div>
          </TiltCard>

          {/* Card 6 */}
          <TiltCard glowColor="rgba(182, 156, 255, 0.4)" className="rounded-3xl">
            <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B69CFF] to-[#713CFF] flex items-center justify-center text-white mb-5 shadow-glow-purple">
                  <QrCode className="h-6 w-6 text-[#F8FAFF]" />
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFF] mb-2 font-display">Live Webcam Barcode Scanner</h3>
                <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
                  Scan product barcodes directly using your laptop or smartphone camera with red laser guide, front/rear camera switcher, and instant audio scan chimes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-semibold text-[#B69CFF] flex items-center gap-1">
                <span>No expensive hardware needed</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 5. Lightning-Fast 3-Step Interactive Timeline */}
      <section id="workflow" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-3.5 py-1.5 rounded-full border border-[#00E5FF]/20">
            Speed That Sells
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFF] mt-4 font-display">
            From Spoken Words to Settled Cash in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-7 rounded-3xl glass-panel relative">
            <div className="text-5xl font-black text-[#713CFF]/30 mb-4 font-display">01</div>
            <h3 className="text-xl font-bold text-[#F8FAFF] mb-2">Speak, Scan, or Click</h3>
            <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
              Press the voice button and speak naturally, scan barcodes through your webcam, or tap items from the visual POS grid.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-panel relative">
            <div className="text-5xl font-black text-[#287BFF]/30 mb-4 font-display">02</div>
            <h3 className="text-xl font-bold text-[#F8FAFF] mb-2">AI Calculates & Verifies</h3>
            <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
              VoiceBill AI cross-references inventory levels, applies GST/discounts, checks customer credit, and computes totals in milliseconds.
            </p>
          </div>

          <div className="p-7 rounded-3xl glass-panel relative">
            <div className="text-5xl font-black text-[#00E5FF]/30 mb-4 font-display">03</div>
            <h3 className="text-xl font-bold text-[#F8FAFF] mb-2">Print, WhatsApp & Reconcile</h3>
            <p className="text-[#B69CFF]/80 text-xs sm:text-sm leading-relaxed">
              Print a 80mm thermal receipt, send via WhatsApp with dynamic UPI QR, and close your day with an automated Z-Report reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Interactive ROI & Savings Calculator */}
      <section id="calculator" className="relative z-10 py-20 px-4 sm:px-8 max-w-5xl mx-auto border-t border-white/[0.08]">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-[#713CFF]/30 shadow-glow-multi">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1 rounded-full border border-[#00E5FF]/20">
              Interactive ROI Calculator
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFF] mt-3 font-display">
              Calculate Your Store's Monthly Savings
            </h2>
            <p className="text-[#B69CFF]/80 text-xs sm:text-sm mt-1">
              Move the slider to estimate time & revenue saved using VoiceBill AI.
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-8">
            <div className="flex justify-between items-center text-sm font-semibold text-[#F8FAFF] mb-2">
              <span>Daily Customer Bills:</span>
              <span className="text-xl font-black text-[#00E5FF] font-display">{dailyBills} bills/day</span>
            </div>
            <input 
              type="range"
              min="20"
              max="400"
              step="10"
              value={dailyBills}
              onChange={(e) => setDailyBills(Number(e.target.value))}
              className="w-full h-2 bg-[#131B38] rounded-lg appearance-none cursor-pointer accent-[#713CFF]"
            />
            <div className="flex justify-between text-[10px] text-[#B69CFF] mt-1 font-mono">
              <span>20 bills</span>
              <span>200 bills</span>
              <span>400 bills</span>
            </div>
          </div>

          {/* Calculator Output Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-[#080B1A]/80 border border-white/[0.08]">
              <div className="text-xs text-[#B69CFF] font-semibold uppercase">Checkout Hours Saved</div>
              <div className="text-2xl sm:text-3xl font-black text-[#00E5FF] mt-1 font-display">
                {hoursSavedPerMonth} hrs
              </div>
              <div className="text-[10px] text-[#F8FAFF]/40 mt-1">every single month</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#080B1A]/80 border border-white/[0.08]">
              <div className="text-xs text-[#B69CFF] font-semibold uppercase">Total Monthly Bills</div>
              <div className="text-2xl sm:text-3xl font-black text-[#713CFF] mt-1 font-display">
                {monthlyBills.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#F8FAFF]/40 mt-1">transactions processed</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#131B38] to-[#080B1A] border border-[#00E5FF]/40 shadow-glow-cyan">
              <div className="text-xs text-[#00E5FF] font-semibold uppercase">Estimated Net Savings</div>
              <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#F8FAFF] mt-1 font-display">
                ₹{moneySavedPerMonth.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-[#B69CFF] mt-1">labor + error recovery / mo</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Transparent Pricing Plans */}
      <section id="pricing" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#713CFF] bg-[#713CFF]/10 px-3.5 py-1.5 rounded-full border border-[#713CFF]/30">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFF] mt-4 font-display">
            Invest in Your Retail Speed
          </h2>
          <p className="text-[#B69CFF]/80 text-sm mt-2">No hidden hardware costs. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="p-8 rounded-3xl glass-panel flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-[#F8FAFF] mb-1 font-display">Starter</div>
              <div className="text-xs text-[#B69CFF] mb-6">For single counters & kiosks</div>
              <div className="text-4xl font-black text-[#F8FAFF] mb-6 font-display">₹0 <span className="text-sm font-normal text-[#B69CFF]">/forever</span></div>
              <ul className="space-y-3.5 text-xs text-[#F8FAFF]/90">
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Up to 200 invoices / month</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Voice billing in Hindi & English</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Product catalog management</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Thermal 80mm/58mm printing</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 w-full py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFF] text-xs font-bold transition text-center border border-white/[0.1]"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro AI Plan (Featured) */}
          <TiltCard glowColor="rgba(113, 60, 255, 0.5)" className="rounded-3xl">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1B0D3D] via-[#131B38] to-[#080B1A] border-2 border-[#713CFF] relative flex flex-col justify-between h-full shadow-glow-multi">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#713CFF] to-[#00E5FF] text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                Most Popular
              </div>
              <div>
                <div className="text-lg font-bold text-[#F8FAFF] mb-1 font-display">Pro AI Copilot</div>
                <div className="text-xs text-[#B69CFF] mb-6">For growing retailers & busy shops</div>
                <div className="text-4xl font-black text-[#F8FAFF] mb-6 font-display">₹799 <span className="text-sm font-normal text-[#B69CFF]">/month</span></div>
                <ul className="space-y-3.5 text-xs text-[#F8FAFF]">
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Unlimited invoices & POS tickets</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Full BillMate AI business assistant</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Live camera barcode scanning</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> WhatsApp payment reminders & UPI QR</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Day-End cash reconciliation (Z-Report)</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> 1-Click CSV & encrypted DB backups</li>
                </ul>
              </div>
              <Link
                to="/login"
                className="btn-gradient-primary mt-8 w-full py-3.5 rounded-xl text-white text-xs font-bold transition text-center shadow-glow-purple"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </TiltCard>

          {/* Enterprise Plan */}
          <div className="p-8 rounded-3xl glass-panel flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-[#F8FAFF] mb-1 font-display">Enterprise</div>
              <div className="text-xs text-[#B69CFF] mb-6">For multi-counter chains & wholesale</div>
              <div className="text-4xl font-black text-[#F8FAFF] mb-6 font-display">₹1,999 <span className="text-sm font-normal text-[#B69CFF]">/month</span></div>
              <ul className="space-y-3.5 text-xs text-[#F8FAFF]/90">
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Multi-branch centralized inventory</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Custom GSTIN prefixes & branch codes</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Role-based cashier access controls</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-[#00E5FF] shrink-0" /> Priority 24/7 technical support</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 w-full py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFF] text-xs font-bold transition text-center border border-white/[0.1]"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Genuine Social Proof & Testimonials */}
      <section className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-3.5 py-1.5 rounded-full border border-[#00E5FF]/20">
            Merchant Love
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFF] mt-4 font-display">
            Trusted by India's Top Retailers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <TiltCard key={idx} glowColor="rgba(40, 123, 255, 0.3)" className="rounded-3xl">
              <div className="p-7 rounded-3xl glass-panel h-full flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-[#F8FAFF]/90 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.color} text-white font-black flex items-center justify-center text-sm shadow-md`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F8FAFF]">{t.name}</div>
                    <div className="text-[11px] text-[#B69CFF]">{t.role}</div>
                    <div className="text-[10px] text-[#F8FAFF]/40">{t.city}</div>
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-white/[0.08]">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#B69CFF] bg-[#B69CFF]/10 px-3.5 py-1.5 rounded-full border border-[#B69CFF]/20">
            Questions & Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFF] mt-4 font-display">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="rounded-2xl glass-panel overflow-hidden border border-white/[0.08] transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-[#F8FAFF] hover:text-[#00E5FF] transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-[#B69CFF] transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-[#00E5FF]' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-xs sm:text-sm text-[#B69CFF]/90 leading-relaxed border-t border-white/[0.05] pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <section className="relative z-10 py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-[#1B0D3D] via-[#131B38] to-[#0A1A3F] border border-[#713CFF]/50 backdrop-blur-2xl shadow-glow-multi relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFF] mb-4 font-display">
            Ready to Supercharge Your Billing?
          </h2>
          <p className="text-[#B69CFF] max-w-xl mx-auto text-sm sm:text-base mb-8">
            Experience the voice-activated POS platform built for the next generation of commerce.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-extrabold bg-[#F8FAFF] text-[#080B1A] shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 group"
          >
            <span>Start Billing Smarter Now</span>
            <ArrowRight className="h-5 w-5 text-[#713CFF] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 11. Futuristic SaaS Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#050711] py-12 px-4 sm:px-8 text-xs text-[#B69CFF]/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#713CFF] to-[#00E5FF] flex items-center justify-center text-white font-black text-sm shadow-glow-purple">
              V
            </div>
            <div>
              <div className="font-bold text-[#F8FAFF] text-sm font-display">VoiceBill AI Platform</div>
              <div className="text-[11px] text-[#B69CFF]/70">Universal Voice POS, Billing & Retail Copilot</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[#F8FAFF] transition">Features</a>
            <a href="#demo" className="hover:text-[#F8FAFF] transition">Voice Sandbox</a>
            <a href="#pricing" className="hover:text-[#F8FAFF] transition">Pricing</a>
            <Link to="/login" className="hover:text-[#F8FAFF] transition">Sign In</Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#B69CFF] font-medium text-[11px]">All Systems Operational</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.04] text-center text-[11px] text-[#B69CFF]/40 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} VoiceBill AI. All rights reserved.</div>
          <div className="text-[#00E5FF]/60 font-mono">Designed for speed, accuracy & compliance.</div>
        </div>
      </footer>
    </div>
  );
}
