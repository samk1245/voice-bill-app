'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export default function TeacherDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/teachers/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setTeacher(data))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading teacher profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center py-24 px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Teacher Profile Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">
              The teacher profile you are looking for could not be found.
            </p>
            <Link
              href="/teachers"
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
            >
              Back to Teachers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/teachers"
              className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Teachers
            </Link>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            {/* Header profile banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg shrink-0 bg-slate-800">
                <img
                  src={
                    teacher.photo ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center sm:text-left space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  Primary Faculty
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{teacher.name}</h1>
                <p className="text-sm text-amber-200 font-medium">{teacher.designation}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-300">
                  {teacher.subject && <span>Subject: {teacher.subject}</span>}
                  {teacher.subject && teacher.class && <span>•</span>}
                  {teacher.class && <span>Class: {teacher.class}</span>}
                </div>
              </div>
            </div>

            {/* Placeholder notice if applicable */}
            {teacher.name.includes('Update from Admin') && (
              <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Note: This profile contains placeholder data. The school administrator will update it with verified details.
                </span>
              </div>
            )}

            <div className="p-6 sm:p-10 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-3">Teacher Biography</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {teacher.biography}
                </p>
              </div>

              {teacher.experience && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Experience & Background
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {teacher.experience}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
