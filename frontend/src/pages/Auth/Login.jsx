import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginStart } from '../../store/authSlice.js';
import { 
  Sparkles, Store, ArrowRight, Check, Phone, ShieldCheck, 
  Mic, Zap, Globe, Lock, UserCheck, AlertCircle 
} from 'lucide-react';

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
    // Auto simulate sending OTP
    setSentOtp('123456');
    setStep('otp');
    setOtp('123456');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* Dynamic Animated Glowing Backdrops */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />

      {/* Language Switcher Ribbon */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs">
        <Globe className="h-3.5 w-3.5 text-purple-400 ml-1.5" />
        {['Hinglish', 'हिंदी', 'English'].map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
              selectedLanguage === lang 
                ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in my-6">
        
        {/* Decorative Top Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 border border-white/10 backdrop-blur-xl text-xs font-bold text-slate-200 shadow-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Voice-Powered Retail AI</span>
            <span className="text-purple-400">v2.5</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-[36px] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          
          {/* Subtle top edge glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" />

          {/* Logo & Headline */}
          <div className="text-center mb-7">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-cyan-400 text-white shadow-xl shadow-purple-500/25 mb-4 transform hover:scale-105 transition-transform">
              <Mic className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">VoiceBill AI</h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
              Bol kar bill banao • Apne kirana aur dukan ko smart AI se tez chalao
            </p>
          </div>

          {/* Error Message banner */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER INPUT */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Dukandar Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 font-bold text-sm">
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
                    className="w-full pl-24 pr-4 py-3.5 rounded-2xl text-white glass-input text-base font-bold tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  OTP verification code will be sent to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length < 10}
                className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 disabled:opacity-40 disabled:pointer-events-none text-sm tracking-wide"
              >
                <span>{loading ? 'Sending OTP...' : 'Get Instant OTP'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick 1-Click Demo Accounts */}
              <div className="pt-4 border-t border-white/10">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-3">
                  🚀 1-Click Demo Logins
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('9876543210', 'Owner')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/30 text-left transition-all active:scale-95 group"
                  >
                    <span className="text-[10px] font-bold text-violet-400 flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> Shop Owner
                    </span>
                    <span className="block text-xs font-bold text-slate-200 mt-0.5">Rajesh Gupta</span>
                    <span className="text-[10px] font-mono text-slate-500">Apna Kirana</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('9812345670', 'Cashier')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-left transition-all active:scale-95 group"
                  >
                    <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Cashier Staff
                    </span>
                    <span className="block text-xs font-bold text-slate-200 mt-0.5">Amit Sharma</span>
                    <span className="text-[10px] font-mono text-slate-500">POS Terminal</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
              <div className="text-center">
                <p className="text-xs text-slate-400">Verification code sent to</p>
                <p className="text-base font-bold text-white mt-0.5">🇮🇳 +91 {mobile}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 rounded-2xl text-white glass-input text-center text-xl font-mono font-black tracking-[0.4em]"
                />
              </div>

              {/* Fast autofill hint badge */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Sandbox Code: <strong>{sentOtp || '123456'}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(sentOtp || '123456')}
                  className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-1 rounded-lg hover:bg-emerald-400"
                >
                  Auto-fill
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 disabled:opacity-40 text-sm"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{loading ? 'Verifying...' : 'Verify & Open Terminal'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
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
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border border-purple-500/30 text-xs font-black text-purple-300 uppercase tracking-wider">
                  🎉 Welcome! Setup Your Shop
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Dukan / Business Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Gupta General Store"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl text-white glass-input text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-white glass-input text-xs font-semibold"
                  >
                    <option value="Kirana/Grocery">Kirana/Grocery</option>
                    <option value="Pharmacy">Pharmacy / Chemist</option>
                    <option value="Restaurant">Restaurant / Cafe</option>
                    <option value="Clothing Store">Clothing / Garments</option>
                    <option value="Hardware Shop">Hardware & Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">UPI Payee ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="shopname@okaxis"
                    className="w-full px-3 py-2.5 rounded-xl text-white glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Shop Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop No. 4, Main Bazar, Rohini"
                  className="w-full px-3 py-2.5 rounded-xl text-white glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="07AAAAA1111A1Z1"
                  className="w-full px-3 py-2.5 rounded-xl text-white glass-input text-xs font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !shopName}
                className="w-full mt-2 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 text-xs uppercase tracking-wider"
              >
                <Check className="h-4 w-4" />
                <span>Launch Voice Billing</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
          <span>🔒 256-Bit Offline Encrypted</span>
          <span>•</span>
          <span>Made for Bharat 🇮🇳</span>
        </div>

      </div>

    </div>
  );
}
