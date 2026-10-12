'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('admin@karelibagh.edu.in');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to login');
        return;
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to School Website
        </Link>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
          <GraduationCap className="w-9 h-9 text-amber-300" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Admin Portal Login
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Prathmik Vidyalaya Kareli Bagh, Prayagraj
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs sm:text-sm"
                  placeholder="admin@karelibagh.edu.in"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs sm:text-sm"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials tip */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 -mx-6 sm:-mx-10 -mb-8 px-6 sm:px-10 py-4 rounded-b-3xl text-xs text-slate-500">
            <span className="font-bold text-slate-700 block mb-1">Demo Admin Credentials:</span>
            <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
              <p>Email: <span className="font-semibold text-blue-700">admin@karelibagh.edu.in</span></p>
              <p>Password: <span className="font-semibold text-blue-700">Admin@12345</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
