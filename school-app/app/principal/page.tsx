'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  GraduationCap,
  Award,
  BookOpen,
  Heart,
  Quote,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function PrincipalPage() {
  const { t } = useLanguage();
  const [principal, setPrincipal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/principal')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPrincipal(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              School Leadership
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Meet Our Principal
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Leading Prathmik Vidyalaya Kareli Bagh with dedication, warmth, and educational vision.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading profile...</p>
            </div>
          ) : !principal ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
              <p className="text-sm text-slate-500">Principal profile not available.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              {/* Top Banner with Photo */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center gap-8">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl shrink-0 bg-slate-800">
                  <img
                    src={
                      principal.photo ||
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={principal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-semibold bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    School Leadership
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {principal.name}
                  </h2>
                  <p className="text-sm text-amber-200 font-medium">{principal.designation}</p>
                  <p className="text-xs text-slate-300">
                    Prathmik Vidyalaya Kareli Bagh • Prayagraj, UP
                  </p>
                </div>
              </div>

              {/* Notice marker if placeholder */}
              {principal.name.includes('Update from Admin') && (
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Note: This is an editable placeholder profile. The school administrator can update this with verified credentials and photographs from the admin dashboard.
                  </span>
                </div>
              )}

              {/* Profile Details */}
              <div className="p-6 sm:p-10 space-y-8">
                {/* Biography */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-700" />
                    About the Principal
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {principal.biography}
                  </p>
                </div>

                {/* Education & Experience Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1.5 uppercase tracking-wider">
                      <Award className="w-4 h-4 text-blue-700" />
                      Educational Qualifications
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">
                      {principal.education || 'To be updated by Admin'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      Educational Leadership & Experience
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">
                      {principal.experience || 'To be updated by Admin'}
                    </p>
                  </div>
                </div>

                {/* Message to Students */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
                    <Quote className="w-4 h-4 text-amber-600" />
                    Message for Our Beloved Students
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed italic">
                    “{principal.messageStudents}”
                  </p>
                </div>

                {/* Message to Parents */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-3">
                    <Heart className="w-4 h-4 text-indigo-600" />
                    Message for Parents & Guardians
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed italic">
                    “{principal.messageParents}”
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
