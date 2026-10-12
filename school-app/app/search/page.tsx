'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search as SearchIcon,
  Calendar,
  Users,
  Compass,
  Bell,
  Camera,
  ChevronRight,
} from 'lucide-react';

export default function SearchPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    activities: any[];
    teachers: any[];
    staff: any[];
    facilities: any[];
    announcements: any[];
    gallery: any[];
  }>({
    activities: [],
    teachers: [],
    staff: [],
    facilities: [],
    announcements: [],
    gallery: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const totalResults =
    (results.activities?.length || 0) +
    (results.teachers?.length || 0) +
    (results.staff?.length || 0) +
    (results.facilities?.length || 0) +
    (results.announcements?.length || 0) +
    (results.gallery?.length || 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Search School Information
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Find activities, teachers, facilities, circulars, and gallery pictures across the school.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type sports, classroom, admission, science, garden..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4" />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-16 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Searching records...</p>
            </div>
          ) : searched && totalResults === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <SearchIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No matching records found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with different terms like "sports", "classroom", "garden", or "kitchen".
              </p>
            </div>
          ) : (
            searched && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs text-slate-500">
                  <span>Found {totalResults} matching results for "{query}"</span>
                </div>

                {/* Activities */}
                {results.activities?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      Activities ({results.activities.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.activities.map((a) => (
                        <Link
                          key={a._id}
                          href={`/activities/${a.slug || a._id}`}
                          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-all flex items-start justify-between group"
                        >
                          <div>
                            <span className="text-[11px] text-blue-700 font-semibold block">{a.category}</span>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700">{a.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{a.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {results.facilities?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-700" />
                      Facilities ({results.facilities.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.facilities.map((f) => (
                        <Link
                          key={f._id}
                          href={`/school/facilities/${f.slug || f._id}`}
                          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition-all flex items-start justify-between group"
                        >
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">{f.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{f.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teachers & Staff */}
                {(results.teachers?.length > 0 || results.staff?.length > 0) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-700" />
                      People & Staff ({(results.teachers?.length || 0) + (results.staff?.length || 0)})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.teachers.map((t) => (
                        <Link
                          key={t._id}
                          href={`/teachers/${t.slug || t._id}`}
                          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all flex items-start justify-between group"
                        >
                          <div>
                            <span className="text-[11px] text-amber-700 font-semibold block">{t.designation}</span>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700">{t.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{t.subject || t.biography}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 shrink-0 mt-1" />
                        </Link>
                      ))}
                      {results.staff.map((s) => (
                        <div
                          key={s._id}
                          className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between"
                        >
                          <div>
                            <span className="text-[11px] text-emerald-700 font-semibold block">{s.category}</span>
                            <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{s.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Announcements */}
                {results.announcements?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-rose-700" />
                      Announcements ({results.announcements.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.announcements.map((ann) => (
                        <Link
                          key={ann._id}
                          href={`/announcements/${ann.slug || ann._id}`}
                          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-400 transition-all flex items-start justify-between group"
                        >
                          <div>
                            <span className="text-[11px] text-slate-400 block">{ann.date}</span>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700">{ann.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{ann.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-700 shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {results.gallery?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-purple-700" />
                      Gallery Pictures ({results.gallery.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {results.gallery.map((g) => (
                        <Link
                          key={g._id}
                          href="/gallery"
                          className="relative h-28 rounded-xl overflow-hidden bg-slate-100 group shadow-sm block"
                        >
                          <img
                            src={g.image}
                            alt={g.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                            <span className="text-xs font-semibold truncate">{g.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
