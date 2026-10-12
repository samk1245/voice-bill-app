import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice.js';
import { Store, User, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterVendor() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleStoreNameChange = (e) => {
    const val = e.target.value;
    setStoreName(val);
    // Auto-generate clean slug suggestion
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')         // replace spaces with hyphens
      .replace(/-+/g, '-');         // remove duplicate hyphens
    setStoreSlug(autoSlug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !storeName || !storeSlug) {
      setError('All fields are required to register your vendor account');
      return;
    }

    const cleanSlug = storeSlug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanSlug) {
      setError('Store slug contains invalid characters');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register Vendor User
      const userRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'Vendor' })
      });

      const userData = await userRes.json();
      if (!userRes.ok) {
        throw new Error(userData.message || 'Vendor user registration failed');
      }

      // Step 2: Establish Store profile using the new JWT token
      const storeRes = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          name: storeName,
          slug: cleanSlug,
          description: `Welcome to ${storeName}! Check out our catalogue.`
        })
      });

      const storeData = await storeRes.json();
      if (!storeRes.ok) {
        throw new Error(storeData.message || 'Store initialization failed');
      }

      // Save credentials in Redux
      dispatch(loginSuccess({ token: userData.token, user: userData.user }));
      
      // Redirect to Vendor Dashboard
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full animate-fade-in relative z-10">
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/25">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Create Vendor Store</h2>
            <p className="text-slate-400 text-sm mt-2">
              Set up your seller account and register your online shop in one go.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Details */}
            <div className="border-b border-white/5 pb-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> 1. Vendor Account Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@techzone.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Store Details */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                <Store className="h-4 w-4" /> 2. Store Profile Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={handleStoreNameChange}
                    placeholder="TechZone Electronics"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Store URL Slug</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-500 text-xs select-none">/store/</span>
                    <input
                      type="text"
                      required
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="techzone"
                      className="w-full pl-16 pr-4 py-3 rounded-xl text-white glass-input text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/10 hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Setting up environment...' : 'Register & Setup Store'}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
