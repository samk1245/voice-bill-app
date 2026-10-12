import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Shield, Paintbrush, DollarSign, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all active stores to showcase live tenants
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/stores/slug/techzone'); // Just checking health/availability or getting them
        // Let's do a general public check, or fetch all from backend public stores listing
        // Since we don't have a public all-stores endpoint, we will mock or try to fetch
        const res = await fetch('/api/stores/slug/techzone');
        if (res.ok) {
          const tz = await res.json();
          setStores([tz]);
        }
      } catch (err) {
        console.error('Error fetching landing stores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const features = [
    {
      title: 'Isolated Multi-Tenancy',
      description: 'Fully isolated vendor data and store customizations. Every store operates on its own configuration and inventory scope.',
      icon: Store,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      title: 'No-Code Store Customizer',
      description: 'Change banners, upload logos, customize theme palettes, and configure product variants instantly without writing single line of code.',
      icon: Paintbrush,
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Flexible Checkout & Stripe Connect',
      description: 'Provide your customers with checkouts using Stripe, complete with sandbox fallback toggles for developers.',
      icon: DollarSign,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Robust Super Admin Panel',
      description: 'Platform owners can inspect all vendor records, suspend or reinstate stores, and track platform-wide aggregated analytics.',
      icon: Shield,
      color: 'from-amber-400 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-8 animate-pulse">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
          Next-Generation MERN E-Commerce SaaS
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
          Start your multi-tenant <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            digital storefront
          </span> in seconds.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Empower your enterprise. Register as a vendor, customize your brand profile, list inventories, and process checkouts seamlessly with full data isolation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register-vendor"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group"
          >
            Launch Your Store
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Engineered for Scale and Isolation</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
            Everything you need to launch a secure, customizable, multi-tenant digital marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors flex gap-6">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${feature.color} flex items-center justify-center shrink-0 shadow-lg text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Store Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-white/5 mb-12">
        <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden bg-gradient-to-tr from-slate-900/50 to-indigo-950/20">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Explore Live Showcase Stores</h2>
              <p className="text-slate-400 mt-3 max-w-lg text-sm md:text-base leading-relaxed">
                Test the client experience. Visit our pre-configured sandbox store to browse items, test variants, and try out our checkout flows.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {!loading && stores.length > 0 ? (
                stores.map((store) => (
                  <Link
                    key={store._id}
                    to={`/store/${store.slug}`}
                    className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:border-emerald-500/20 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                        {store.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-bold text-white">{store.name}</h4>
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Live Sandbox
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                  </Link>
                ))
              ) : (
                <div className="text-slate-500 text-sm italic">Loading sandbox stores...</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
