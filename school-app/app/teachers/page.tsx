'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  Users,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function TeachersPage() {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teachers')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTeachers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Academic Mentors
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Our Teachers & Educators
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Meet our passionate teaching staff dedicated to foundational learning, character building, and joyful classroom discovery.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading educators...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No teachers listed yet</h3>
              <p className="text-xs text-slate-500">
                Teacher profiles will be added by the School Administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.map((tch) => (
                <div
                  key={tch._id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-center p-6 group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-50 shadow-md group-hover:scale-105 transition-transform bg-slate-100">
                      <img
                        src={
                          tch.photo ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={tch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h2 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                      {tch.name}
                    </h2>
                    <span className="text-xs text-blue-700 font-semibold block mt-0.5">
                      {tch.designation}
                    </span>

                    {tch.subject && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        {tch.subject}
                      </span>
                    )}

                    {tch.class && (
                      <span className="text-xs text-slate-400 block mt-1">
                        Class: {tch.class}
                      </span>
                    )}

                    <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                      {tch.biography}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 w-full">
                    <Link
                      href={`/teachers/${tch.slug || tch._id}`}
                      className="inline-flex items-center justify-center w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors gap-1"
                    >
                      <span>View Teacher Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
