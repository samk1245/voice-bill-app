import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure, loginStart } from '../../store/authSlice.js';
import { MessageSquare, Phone, ShieldCheck, Sparkles, Store, Check, ArrowRight } from 'lucide-react';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'setup'
  const [sentOtp, setSentOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shop Setup fields (shown for new users)
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('Kirana/Grocery');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Hinglish');
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

      // If it's a new user, proceed to Shop Setup screen
      if (data.isNewUser) {
        // Temporarily store the auth token in memory so we can submit the store profile
        dispatch(loginStart());
        localStorage.setItem('tempToken', data.token);
        localStorage.setItem('tempUser', JSON.stringify(data.user));
        setStep('setup');
      } else {
        // Existing user, log in directly
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
      // 1. Create the store
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
          preferredLanguage,
          upiId
        })
      });
      const storeData = await storeRes.json();
      if (!storeRes.ok) throw new Error(storeData.message || 'Failed to setup shop');

      // 2. Dispatch successful login state
      dispatch(loginSuccess({ token, user }));
      
      // Clean up temporary items
      localStorage.removeItem('tempToken');
      localStorage.removeItem('tempUser');

      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoNumber = (number) => {
    setMobile(number);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Main Mobile Frame wrapper for desktop, standard fit on mobile */}
      <div className="w-full max-w-[420px] bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col aspect-[9/19] max-h-[850px] relative z-10">
        
        {/* Mobile Header / Status bar simulation */}
        <div className="px-6 py-3 bg-slate-900 flex justify-between items-center text-xs text-slate-500 border-b border-white/5">
          <span>VoiceBill AI</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online Sandbox</span>
          </span>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          
          {/* Logo & Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 mb-4">
              <Store className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">VoiceBill AI</h2>
            <p className="text-xs text-slate-400 mt-2">Create professional bills simply by speaking</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          {/* STEP 1: ENTER PHONE NUMBER */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      required
                      className="w-full pl-14 pr-4 py-3.5 rounded-xl text-white glass-input text-sm font-bold tracking-wide"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  We'll send a 6-digit confirmation OTP to your mobile phone.
                </p>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/10"
                >
                  <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Demo Quick Logins helper */}
                <div className="mt-8 border-t border-white/5 pt-6">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase text-center mb-3">Quick Demo Shopkeepers</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fillDemoNumber('9876543210')}
                      className="py-2.5 px-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-left text-slate-300 font-semibold flex flex-col"
                    >
                      <span className="text-[10px] text-emerald-400">Owner Account</span>
                      <span>9876543210</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoNumber('9812345670')}
                      className="py-2.5 px-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-left text-slate-300 font-semibold flex flex-col"
                    >
                      <span className="text-[10px] text-emerald-400">Cashier Account</span>
                      <span>9812345670</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Enter the verification code sent to</p>
                  <p className="text-sm font-bold text-white mt-1">+91 {mobile}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-white glass-input text-center text-lg font-mono font-bold tracking-widest"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Use code <strong className="font-bold underline">{sentOtp}</strong> to verify instantly.</span>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/10"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Edit phone number
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW SHOP SETUP FORM */}
          {step === 'setup' && (
            <form onSubmit={handleShopSetupSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-center mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    🎉 Setup Shop profile
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Rajesh Kirana Store"
                    required
                    className="w-full px-3 py-2 rounded-xl text-white glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Business Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-white glass-input text-xs"
                    >
                      <option value="Kirana/Grocery">Kirana/Grocery</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Clothing Store">Clothing Store</option>
                      <option value="Hardware Shop">Hardware Shop</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Preferred Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-white glass-input text-xs"
                    >
                      <option value="Hinglish">Hinglish</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Shop Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop No 4, Main Bazar"
                    className="w-full px-3 py-2 rounded-xl text-white glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 07AAAAA1111A1Z1"
                      className="w-full px-3 py-2 rounded-xl text-white glass-input text-xs font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">UPI ID for Payments</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. shopname@upi"
                      className="w-full px-3 py-2 rounded-xl text-white glass-input text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/10"
                >
                  <Check className="h-4 w-4" />
                  <span>{loading ? 'Creating Shop...' : 'Create & Open Shop'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Mobile footer simulation */}
        <div className="px-6 py-4 bg-slate-900 border-t border-white/5 flex justify-center text-[10px] text-slate-500">
          <span>© 2026 VoiceBill AI • Secure Offline Invoicing</span>
        </div>
      </div>
    </div>
  );
}
