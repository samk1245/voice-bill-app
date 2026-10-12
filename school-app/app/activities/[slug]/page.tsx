'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Lightbox from '@/components/public/Lightbox';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Users,
  Target,
  Trophy,
  Camera,
  Share2,
} from 'lucide-react';

export default function ActivityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetch(`/api/activities/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setActivity(data))
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
            <p className="text-xs text-slate-500">Loading activity details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center py-24 px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Activity Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">
              The event you are searching for might have been moved or removed.
            </p>
            <Link
              href="/activities"
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
            >
              Back to Activities
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [
    ...(activity.coverImage ? [activity.coverImage] : []),
    ...(activity.images || []),
  ].filter((img, idx, self) => self.indexOf(img) === idx);

  const lightboxItems = allImages.map((src) => ({
    src,
    title: activity.title,
    caption: `${activity.category} • ${activity.date}`,
  }));

  const isUpcoming = activity.status === 'upcoming';

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/activities"
              className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Activities
            </Link>
          </div>

          {/* Hero Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm mb-8">
            {activity.coverImage && (
              <div className="relative h-64 sm:h-96 w-full bg-slate-900 overflow-hidden">
                <img
                  src={activity.coverImage}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      {activity.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow ${
                        isUpcoming
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isUpcoming ? 'Upcoming Event' : 'Conducted Event'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-sm">
                    {activity.title}
                  </h1>
                </div>
              </div>
            )}

            {/* Event Meta Bar */}
            <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Event Date</span>
                  <span className="font-bold text-slate-800">{activity.date}</span>
                </div>
              </div>

              {activity.time && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Scheduled Time</span>
                    <span className="font-bold text-slate-800">{activity.time}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Location / Venue</span>
                  <span className="font-bold text-slate-800">
                    {activity.location || 'School Campus'}
                  </span>
                </div>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-3">About the Activity</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>
              </div>

              {/* Objectives */}
              {activity.objectives && (
                <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                    <Target className="w-4 h-4" />
                    <span>Learning & Activity Objectives</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activity.objectives}
                  </p>
                </div>
              )}

              {/* Participation & Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activity.participation && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Student Participation</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activity.participation}
                    </p>
                  </div>
                )}

                {activity.results && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                      <span>Results & Outcomes</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{activity.results}</p>
                  </div>
                )}
              </div>

              {/* Teachers Involved */}
              {activity.teachersInvolved?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Teachers & Coordinators Involved
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activity.teachersInvolved.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photographs Gallery */}
              {allImages.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-700" />
                      Activity Photo Gallery ({allImages.length})
                    </h3>
                    <span className="text-xs text-slate-400">Click any photo to view full size</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                        className="relative h-32 rounded-xl overflow-hidden cursor-pointer group bg-slate-100 shadow-sm"
                      >
                        <img
                          src={img}
                          alt={`${activity.title} photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        images={lightboxItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxItems.length - 1))}
        onNext={() => setLightboxIndex((prev) => (prev < lightboxItems.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
