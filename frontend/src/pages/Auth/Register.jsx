import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice.js';
import { User, Lock, Mail, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Read where they came from
  const fromStore = location.state?.fromStore;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all details');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'Customer' })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Customer registration failed');
      }

      dispatch(loginSuccess({ token: data.token, user: data.user }));

      if (fromStore) {
        navigate(`/store/${fromStore}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full animate-fade-in relative z-10">
        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mb-4 border border-pink-500/20">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Create Shopper Account</h2>
            <p className="text-slate-400 text-sm mt-2">
              {fromStore 
                ? `Sign up to complete your checkout at ${fromStore}`
                : 'Sign up to start browsing showcase stores'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                />
              </div>
            </div>

            <div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-indigo-500 shadow-lg shadow-pink-500/20 hover:from-pink-600 hover:to-indigo-600 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Registering...' : 'Sign Up'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" state={{ fromStore }} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
