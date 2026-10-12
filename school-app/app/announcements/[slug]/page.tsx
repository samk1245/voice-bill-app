'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import {
  Calendar,
  Pin,
  ArrowLeft,
  Bell,
  Share2,
} from 'lucide-react';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/announcements/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setAnnouncement(data))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center py-24">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading circular...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center py-24 px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Notice Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">
              This notice may have expired or been removed.
            </p>
            <Link
              href="/announcements"
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
            >
              Back to Announcements
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
              href="/announcements"
              className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Notice Board
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Published on {announcement.date}
                </span>
                {announcement.pinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    <Pin className="w-3 h-3 text-amber-700" />
                    Pinned Notice
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">Basic Education Official Notice</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {announcement.title}
            </h1>

            {announcement.image && (
              <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-slate-100 border border-slate-200">
                <img
                  src={announcement.image}
                  alt={announcement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2">
              {announcement.description}
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span>Issued by: Office of the Headmaster, Prathmik Vidyalaya Kareli Bagh</span>
              <Link
                href="/contact"
                className="text-blue-700 font-semibold hover:underline"
              >
                Questions? Contact School Office →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
