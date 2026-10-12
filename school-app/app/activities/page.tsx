'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Sports',
  'Cultural',
  'Educational',
  'Environmental',
  'National celebrations',
  'Competitions',
  'Awareness programs',
  'School events',
];

export default function ActivitiesPage() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, statusFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/activities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              School Life & Events
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Activities & Celebrations
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Explore our upcoming events, sports meets, cultural programs, and recently completed school milestones.
            </p>
          </div>

          {/* Controls: Search, Category, Status */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 space-y-4">
            {/* Search Bar & Status Tabs */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activities by title or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </form>

              {/* Status Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full md:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setStatusFilter('upcoming')}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-colors ${
                    statusFilter === 'upcoming'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-700 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activities Grid */}
          {loading ? (
            <div className="text-center py-20 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto">
              <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No activities found</h3>
              <p className="text-xs text-slate-500 mb-4">
                No events match your current filter or search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act) => {
                const isUpcoming = act.status === 'upcoming';
                return (
                  <div
                    key={act._id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={
                          act.coverImage ||
                          'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        {act.category || 'General'}
                      </div>
                      <div
                        className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-md shadow ${
                          isUpcoming
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {act.date}
                          </span>
                          {act.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              {act.time}
                            </span>
                          )}
                        </div>

                        <h2 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
                          {act.title}
                        </h2>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                          {act.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {act.location || 'School Campus'}
                        </span>
                        <Link
                          href={`/activities/${act.slug || act._id}`}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:underline"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
