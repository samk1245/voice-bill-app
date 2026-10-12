'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  Bell,
  Calendar,
  Pin,
  ChevronRight,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAnnouncements(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-amber-800 font-semibold text-xs tracking-wider uppercase bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              Notice Board
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              School Announcements & Circulars
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Official circulars, admission notices, parent-teacher meetings, and academic updates from Prathmik Vidyalaya Kareli Bagh.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading circulars...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <Bell className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No announcements right now</h3>
              <p className="text-xs text-slate-500">
                School circulars and notices will appear here once posted by the administration.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start justify-between ${
                    ann.pinned
                      ? 'border-amber-300 ring-1 ring-amber-200/80 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {ann.date}
                      </span>
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                          <Pin className="w-3 h-3 text-amber-700" />
                          Important Notice
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {ann.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {ann.description}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Link
                      href={`/announcements/${ann.slug || ann._id}`}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold text-xs transition-colors gap-1"
                    >
                      <span>Read Full Notice</span>
                      <ChevronRight className="w-4 h-4" />
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
