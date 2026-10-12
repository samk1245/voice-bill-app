'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Lightbox from '@/components/public/Lightbox';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Camera,
  HeartHandshake,
  Compass,
} from 'lucide-react';

export default function FacilityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [facility, setFacility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetch(`/api/facilities/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setFacility(data))
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
            <p className="text-xs text-slate-500">Loading facility details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center py-24 px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Facility Not Found</h2>
            <p className="text-xs text-slate-500 mb-6">
              The facility you are exploring could not be located.
            </p>
            <Link
              href="/school/facilities"
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
            >
              Back to Facilities
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [
    ...(facility.coverImage ? [facility.coverImage] : []),
    ...(facility.images || []),
  ].filter((img, idx, self) => self.indexOf(img) === idx);

  const lightboxItems = allImages.map((src) => ({
    src,
    title: facility.name,
    caption: facility.importance || facility.description,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/school/facilities"
              className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Campus Facilities
            </Link>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm mb-8">
            {facility.coverImage && (
              <div className="relative h-64 sm:h-96 w-full bg-slate-900 overflow-hidden">
                <img
                  src={facility.coverImage}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block shadow">
                    School Infrastructure
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow">
                    {facility.name}
                  </h1>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-3">Facility Overview</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {facility.description}
                </p>
              </div>

              {facility.features?.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Amenities & Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {facility.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {facility.importance && (
                <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-950 mb-2 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-700" />
                    Role in Holistic Student Development
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {facility.importance}
                  </p>
                </div>
              )}

              {allImages.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-700" />
                      Facility Photographs ({allImages.length})
                    </h3>
                    <span className="text-xs text-slate-400">Click photo for lightbox</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setLightboxIndex(idx);
                          setLightboxOpen(true);
                        }}
                        className="relative h-36 rounded-xl overflow-hidden cursor-pointer group bg-slate-100 shadow-sm"
                      >
                        <img
                          src={img}
                          alt={`${facility.name} image ${idx + 1}`}
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
