'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Lightbox from '@/components/public/Lightbox';
import { useLanguage } from '@/context/LanguageContext';
import {
  Camera,
  Filter,
  Calendar,
  Eye,
  Maximize2,
} from 'lucide-react';

const GALLERY_CATEGORIES = [
  'All',
  'School',
  'Classrooms',
  'Activities',
  'Events',
  'Teachers',
  'Students',
  'Garden',
  'Kitchen',
  'Playground',
  'Celebrations',
  'Other',
];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      const res = await fetch(`/api/gallery?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const lightboxItems = gallery.map((g) => ({
    src: g.image,
    title: g.title,
    caption: `${g.category}${g.date ? ' • ' + g.date : ''} — ${g.caption || ''}`,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Visual Memories
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Photo Gallery
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Explore snapshots of everyday learning, sports, festive celebrations, and campus life at Prathmik Vidyalaya Kareli Bagh.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 justify-start lg:justify-center scrollbar-none text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === cat
                    ? 'bg-blue-700 text-white font-semibold shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading photographs...</p>
            </div>
          ) : gallery.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <Camera className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No photographs found</h3>
              <p className="text-xs text-slate-500">
                Photos for this category will be uploaded by the school administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.map((item, idx) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-7 h-7 drop-shadow-md" />
                    </div>
                    <div className="absolute top-2.5 left-2.5 bg-blue-700/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    {item.date && (
                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                    )}
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
        images={lightboxItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxItems.length - 1))}
        onNext={() => setLightboxIndex((prev) => (prev < lightboxItems.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
