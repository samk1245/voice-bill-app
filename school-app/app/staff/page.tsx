'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  Users,
  Filter,
  Heart,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const STAFF_CATEGORIES = [
  'All',
  'Administrative Staff',
  'Support Staff',
  'Kitchen Staff',
  'Maintenance Staff',
  'Other Workers',
];

export default function StaffPage() {
  const { t } = useLanguage();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchStaff();
  }, [selectedCategory]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      const res = await fetch(`/api/staff?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-emerald-700 font-semibold text-xs tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Our Backbone
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Our School Team & Support Staff
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Respecting and recognizing every vital member of our school community — from our mid-day meal cooks to maintenance caretakers and student support assistants.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {STAFF_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading school team...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No staff members listed</h3>
              <p className="text-xs text-slate-500">
                Staff profiles will be added by the administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((st) => (
                <div
                  key={st._id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform">
                    <img
                      src={
                        st.photo ||
                        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={st.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 flex-grow">
                    <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {st.category}
                    </span>
                    <h2 className="font-bold text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
                      {st.name}
                    </h2>
                    <span className="text-xs font-medium text-slate-500 block">
                      Role: {st.role}
                    </span>
                    {st.description && (
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed line-clamp-3">
                        {st.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
