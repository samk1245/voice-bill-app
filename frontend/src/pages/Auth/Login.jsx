import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSuccess, loginStart } from '../../store/authSlice.js';
import { 
  Sparkles, Store, ArrowRight, Check, Phone, ShieldCheck, 
  Mic, Zap, Globe, Lock, UserCheck, AlertCircle, ChevronLeft,
  Shield, CheckCircle2
} from 'lucide-react';
import TiltCard from '../../components/TiltCard.jsx';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'setup'
  const [sentOtp, setSentOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Hinglish');

  // Shop Setup fields (for new users)
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('Kirana/Grocery');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error sending OTP');

      setSentOtp(data.otp);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      if (data.isNewUser) {
        dispatch(loginStart());
        localStorage.setItem('tempToken', data.token);
        localStorage.setItem('tempUser', JSON.stringify(data.user));
        setStep('setup');
      } else {
        dispatch(loginSuccess({ token: data.token, user: data.user }));
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShopSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!shopName) {
      setError('Shop name is required');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('tempToken');
    const user = JSON.parse(localStorage.getItem('tempUser'));

    try {
      const storeRes = await fetch('/api/stores/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: shopName,
          category,
          address,
          gstNumber,
          preferredLanguage: selectedLanguage,
          upiId: upiId || `${shopName.toLowerCase().replace(/\s+/g, '')}@upi`
        })
      });
      const storeData = await storeRes.json();
      if (!storeRes.ok) throw new Error(storeData.message || 'Failed to setup shop');

      dispatch(loginSuccess({ token, user }));
      localStorage.removeItem('tempToken');
      localStorage.removeItem('tempUser');

      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoPhone, roleLabel) => {
    setMobile(demoPhone);
    setError('');
    setSentOtp('123456');
    setStep('otp');
    setOtp('123456');
  };

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#F8FAFF] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#713CFF] selection:text-white font-sans">
      
      {/* Dynamic Animated Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[#713CFF]/20 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-[#00E5FF]/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#287BFF]/10 rounded-full blur-[180px]" />
      </div>

      {/* Top Bar: Return to Landing Page & Language Selector */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link 
          to="/landing"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-[#B69CFF] hover:text-[#F8FAFF] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Product Overview</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl text-xs">
        <Globe className="h-3.5 w-3.5 text-[#00E5FF] ml-1.5 mr-0.5" />
        {['Hinglish', 'हिंदी', 'English'].map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedLanguage === lang 
                ? 'bg-gradient-to-r from-[#713CFF] to-[#287BFF] text-white shadow-glow-purple' 
                : 'text-[#B69CFF] hover:text-[#F8FAFF]'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Main Glassmorphic Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 my-8"
      >
        {/* Release Pill Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#713CFF]/15 to-[#00E5FF]/15 border border-[#713CFF]/30 backdrop-blur-xl text-xs font-bold text-[#B69CFF] shadow-glow-purple">
            <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-ping" />
            <span>Voice-Powered Retail AI</span>
            <span className="text-[#00E5FF]">v2.5</span>
          </div>
        </div>

        <TiltCard glowColor="rgba(113, 60, 255, 0.35)" maxTilt={5} scale={1} className="rounded-3xl">
          <div className="bg-[#0D1226]/80 border border-white/[0.1] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-glow-multi relative overflow-hidden">
            
            {/* Top edge glowing gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#713CFF] via-[#287BFF] to-[#00E5FF]" />

            {/* Logo & Headline */}
            <div className="text-center mb-6 pt-1">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#713CFF] via-[#287BFF] to-[#00E5FF] text-white shadow-glow-purple mb-3">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFF] font-display">
                VoiceBill <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#713CFF] to-[#00E5FF]">AI</span>
              </h1>
              <p className="text-xs text-[#B69CFF] mt-1 max-w-xs mx-auto">
                Speak items, generate tax invoices & manage retail operations with AI.
              </p>
            </div>

            {/* Error Message banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* STEP 1: MOBILE NUMBER INPUT */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#B69CFF] uppercase tracking-wider mb-2">
                    Merchant Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#B69CFF] font-bold text-sm">
                      <span>🇮🇳 +91</span>
                      <span className="h-4 w-px bg-white/15" />
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      required
                      autoFocus
                      className="w-full pl-24 pr-4 py-3.5 rounded-2xl text-[#F8FAFF] bg-[#080B1A]/80 border border-white/[0.1] focus:border-[#713CFF] focus:outline-none focus:ring-2 focus:ring-[#713CFF]/40 text-base font-bold tracking-wider transition"
                    />
                  </div>
                  <p className="text-[11px] text-[#B69CFF]/60 mt-2">
                    Instant 6-digit OTP code will be sent to this mobile number.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || mobile.length < 10}
                  className="btn-gradient-primary w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-glow-purple disabled:opacity-40 disabled:pointer-events-none text-sm tracking-wide"
                >
                  <span>{loading ? 'Sending OTP Code...' : 'Get Instant OTP'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* 1-Click Demo Accounts */}
                <div className="pt-5 border-t border-white/[0.08]">
                  <span className="block text-[10px] font-extrabold text-[#B69CFF] uppercase tracking-widest text-center mb-3">
                    ⚡ 1-Click Demo Logins
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('9876543210', 'Owner')}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-[#713CFF]/15 border border-white/[0.06] hover:border-[#713CFF]/40 text-left transition-all active:scale-95 group"
                    >
                      <span className="text-[10px] font-extrabold text-[#00E5FF] flex items-center gap-1">
                        <UserCheck className="h-3 w-3" /> Shop Owner
                      </span>
                      <span className="block text-xs font-bold text-[#F8FAFF] mt-0.5">Rajesh Gupta</span>
                      <span className="text-[10px] font-mono text-[#B69CFF]">Apna Kirana</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoAccount('9812345670', 'Cashier')}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-[#287BFF]/15 border border-white/[0.06] hover:border-[#287BFF]/40 text-left transition-all active:scale-95 group"
                    >
                      <span className="text-[10px] font-extrabold text-[#287BFF] flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Cashier Staff
                      </span>
                      <span className="block text-xs font-bold text-[#F8FAFF] mt-0.5">Amit Sharma</span>
                      <span className="text-[10px] font-mono text-[#B69CFF]">POS Terminal</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                <div className="text-center">
                  <p className="text-xs text-[#B69CFF]">Verification code sent to</p>
                  <p className="text-base font-bold text-[#F8FAFF] mt-0.5">🇮🇳 +91 {mobile}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#B69CFF] uppercase tracking-wider mb-2 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl text-[#F8FAFF] bg-[#080B1A]/80 border border-white/[0.1] focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 text-center text-xl font-mono font-black tracking-[0.4em] transition"
                  />
                </div>

                {/* Fast autofill hint badge */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#00E5FF]/10 to-[#287BFF]/10 border border-[#00E5FF]/25 text-xs text-[#00E5FF] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00E5FF] shrink-0" />
                    <span>Demo Code: <strong>{sentOtp || '123456'}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(sentOtp || '123456')}
                    className="text-[10px] font-bold bg-[#00E5FF] text-[#080B1A] px-2.5 py-1 rounded-lg hover:bg-white transition"
                  >
                    Auto-fill
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="btn-gradient-primary w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-glow-multi disabled:opacity-40 text-sm"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{loading ? 'Verifying...' : 'Verify & Open Dashboard'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(''); }}
                    className="w-full py-2.5 rounded-xl text-xs text-[#B69CFF] hover:text-[#F8FAFF] transition-colors"
                  >
                    Change Mobile Number
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: NEW SHOP ONBOARDING */}
            {step === 'setup' && (
              <form onSubmit={handleShopSetupSubmit} className="space-y-4 animate-fade-in">
                <div className="text-center pb-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#713CFF]/20 to-[#00E5FF]/20 border border-[#713CFF]/40 text-xs font-black text-[#00E5FF] uppercase tracking-wider">
                    🎉 Welcome! Configure Your Store
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#B69CFF] uppercase mb-1">
                    Store / Business Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Gupta General Store"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl text-[#F8FAFF] bg-[#080B1A]/80 border border-white/[0.1] text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#B69CFF] uppercase mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-[#F8FAFF] bg-[#080B1A] border border-white/[0.1] text-xs font-semibold"
                    >
                      <option value="Kirana/Grocery">Kirana/Grocery</option>
                      <option value="Pharmacy">Pharmacy / Chemist</option>
                      <option value="Restaurant">Restaurant / Cafe</option>
                      <option value="Clothing Store">Clothing / Garments</option>
                      <option value="Hardware Shop">Hardware & Electrical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#B69CFF] uppercase mb-1">UPI Payee ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="shopname@upi"
                      className="w-full px-3 py-2.5 rounded-xl text-[#F8FAFF] bg-[#080B1A]/80 border border-white/[0.1] text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#B69CFF] uppercase mb-1">Shop Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No. 4, Main Market, Mumbai"
                    className="w-full px-3 py-2.5 rounded-xl text-[#F8FAFF] bg-[#080B1A]/80 border border-white/[0.1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#B69CFF] uppercase mb-1">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full px-3 py-2.5 rounded-xl text-[#F8FAFF] bg-[#080B1A]/80 border border-white/[0.1] text-xs font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !shopName}
                  className="btn-gradient-primary w-full mt-2 py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-glow-purple text-xs uppercase tracking-wider"
                >
                  <Check className="h-4 w-4" />
                  <span>Launch Voice Billing</span>
                </button>
              </form>
            )}

          </div>
        </TiltCard>

        {/* Footer Security Badges */}
        <div className="mt-6 text-center text-xs text-[#B69CFF]/60 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-[#00E5FF]" />
            <span>256-Bit Offline Encrypted</span>
          </span>
          <span>•</span>
          <span>Fast Voice Billing Engine</span>
        </div>
      </motion.div>

    </div>
  );
}
