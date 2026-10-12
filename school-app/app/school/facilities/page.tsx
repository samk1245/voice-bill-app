'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Lightbox from '@/components/public/Lightbox';
import { useLanguage } from '@/context/LanguageContext';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  Eye,
  Camera,
  Sparkles,
} from 'lucide-react';

export default function FacilitiesPage() {
  const { t } = useLanguage();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/facilities')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFacilities(data))
      .finally(() => setLoading(false));
  }, []);

  const openFacilityLightbox = (fac: any) => {
    const imgs = (fac.images?.length ? fac.images : [fac.coverImage]).map((src: string) => ({
      src,
      title: fac.name,
      caption: fac.importance || fac.description,
    }));
    setLightboxImages(imgs);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Campus Infrastructure
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Explore Our School & Facilities
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Take a virtual tour of the learning spaces, kitchen, garden, and recreational grounds designed for our primary students.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading facilities...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <Compass className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No facilities listed</h3>
              <p className="text-xs text-slate-500">
                School facilities will be populated by the Administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((fac) => (
                <div
                  key={fac._id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={
                        fac.coverImage ||
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <h2 className="absolute bottom-3.5 left-4 text-white font-bold text-lg drop-shadow">
                      {fac.name}
                    </h2>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {fac.description}
                      </p>

                      {fac.features?.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Key Amenities
                          </span>
                          {fac.features.slice(0, 3).map((feat: string, fIdx: number) => (
                            <div key={fIdx} className="flex items-center text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {fac.importance && (
                        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                          <span className="font-semibold block mb-0.5">Use & Impact:</span>
                          <span className="line-clamp-2">{fac.importance}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => openFacilityLightbox(fac)}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-blue-600" />
                        View Photos ({(fac.images?.length || 0) + (fac.coverImage ? 1 : 0)})
                      </button>

                      <Link
                        href={`/school/facilities/${fac.slug || fac._id}`}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:underline"
                      >
                        Explore Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Lightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))}
        onNext={() => setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
