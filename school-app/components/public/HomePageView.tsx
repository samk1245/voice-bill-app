'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import Lightbox from '@/components/public/Lightbox';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  BookOpen,
  Heart,
  Shield,
  Smile,
  Compass,
  CheckCircle2,
  Users,
  ChevronRight,
  Pin,
  ExternalLink,
  Phone,
  Mail,
  Eye,
  Camera,
} from 'lucide-react';

interface HomePageViewProps {
  initialData: {
    schoolInfo: any;
    principal: any;
    upcomingActivities: any[];
    completedActivities: any[];
    facilities: any[];
    teachers: any[];
    staff: any[];
    announcements: any[];
    gallery: any[];
  };
}

export default function HomePageView({ initialData }: HomePageViewProps) {
  const { t } = useLanguage();
  const {
    schoolInfo,
    principal,
    upcomingActivities,
    completedActivities,
    facilities,
    teachers,
    staff,
    announcements,
    gallery,
  } = initialData;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<
    { src: string; caption?: string; title?: string }[]
  >([]);

  const openLightbox = (
    images: { src: string; caption?: string; title?: string }[],
    index = 0
  ) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const heroImage =
    schoolInfo?.heroImages?.[0] ||
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header */}
      <Header />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
          {/* Hero Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt="Prathmik Vidyalaya Kareli Bagh campus"
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-blue-950/70" />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prayagraj, Uttar Pradesh • Basic Education Department</span>
            </div>

            {/* School Name */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm">
              {schoolInfo?.schoolName || t('schoolName')}
            </h1>

            {/* Subtitle / Tagline */}
            <p className="text-lg sm:text-xl text-amber-200 font-medium mb-6">
              “{schoolInfo?.tagline || t('tagline')}”
            </p>

            {/* Introduction excerpt */}
            <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-200 leading-relaxed mb-10">
              {schoolInfo?.introduction || t('heroSubtitle')}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/school/facilities"
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Compass className="w-5 h-5 text-slate-950" />
                {t('exploreSchoolBtn')}
              </Link>
              <Link
                href="/activities"
                className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm sm:text-base backdrop-blur-md border border-white/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5 text-amber-300" />
                {t('upcomingActivitiesBtn')}
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Quick Navigation Cards */}
        <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: t('quickActivities'), icon: Calendar, href: '/activities', color: 'from-blue-600 to-indigo-600' },
              { title: t('quickFacilities'), icon: Compass, href: '/school/facilities', color: 'from-emerald-600 to-teal-600' },
              { title: t('quickTeachers'), icon: Users, href: '/teachers', color: 'from-amber-600 to-orange-600' },
              { title: t('quickAnnouncements'), icon: Pin, href: '/announcements', color: 'from-rose-600 to-pink-600' },
              { title: t('quickGallery'), icon: Camera, href: '/gallery', color: 'from-purple-600 to-indigo-600' },
              { title: t('quickContact'), icon: Phone, href: '/contact', color: 'from-sky-600 to-blue-600' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="bg-white rounded-xl p-3.5 shadow-md hover:shadow-lg border border-slate-100 flex flex-col items-center text-center group transition-all transform hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. About Our School */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {t('aboutHeading')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              {t('aboutSubheading')}
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {schoolInfo?.introduction ||
                  'Prathmik Vidyalaya Kareli Bagh is a dedicated primary school committed to providing quality foundational education, holistic student development, and a joyful learning atmosphere in Prayagraj.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <BookOpen className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Foundational Literacy</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Focus on reading, writing, and early numeracy.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Safe & Clean Campus</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Hygienic sanitation and purified water.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <Heart className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Mid-Day Meal Program</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Fresh, nutritious food cooked daily.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <Smile className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Joyful Activities</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Sports, arts, plantation, and community events.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800 group"
                >
                  <span>{t('viewFullAbout')}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Images Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                    alt="School students"
                    className="w-full h-44 sm:h-52 object-cover rounded-2xl shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() =>
                      openLightbox([
                        {
                          src: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
                          title: 'Morning Gathering',
                        },
                      ])
                    }
                  />
                  <img
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80"
                    alt="School garden"
                    className="w-full h-32 sm:h-36 object-cover rounded-2xl shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() =>
                      openLightbox([
                        {
                          src: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
                          title: 'Kitchen Garden',
                        },
                      ])
                    }
                  />
                </div>
                <div className="space-y-3 pt-6">
                  <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
                    alt="Classroom"
                    className="w-full h-32 sm:h-36 object-cover rounded-2xl shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() =>
                      openLightbox([
                        {
                          src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
                          title: 'Primary Classroom',
                        },
                      ])
                    }
                  />
                  <img
                    src="https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=600&q=80"
                    alt="Playground"
                    className="w-full h-44 sm:h-52 object-cover rounded-2xl shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() =>
                      openLightbox([
                        {
                          src: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
                          title: 'Playground Games',
                        },
                      ])
                    }
                  />
                </div>
              </div>

              {/* Decorative accent card */}
              <div className="absolute -bottom-4 -left-4 bg-white p-3.5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 max-w-xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Values-Driven Campus</span>
                  <span className="text-slate-500">Respect • Learning • Joy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Upcoming Activities */}
        <section className="py-16 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
                  {t('upcomingActivitiesTitle')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {t('upcomingActivitiesSubtitle')}
                </h2>
              </div>
              <Link
                href="/activities"
                className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                <span>{t('allActivities')}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 text-slate-500">
                <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <p className="font-medium text-sm">No upcoming activities scheduled at the moment.</p>
                <p className="text-xs text-slate-400 mt-1">Please check back soon for upcoming events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingActivities.slice(0, 3).map((act) => (
                  <div
                    key={act._id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/80 flex flex-col group transition-all"
                  >
                    {/* Activity Image */}
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
                        {act.category || 'School Event'}
                      </div>
                      <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-md shadow">
                        Upcoming
                      </div>
                    </div>

                    {/* Activity Body */}
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

                        <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                          {act.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {act.location || 'School Ground'}
                        </span>
                        <Link
                          href={`/activities/${act.slug || act._id}`}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group-hover:underline"
                        >
                          {t('viewDetails')}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. Recently Conducted Activities */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-emerald-700 font-semibold text-xs tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {t('recentActivitiesTitle')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {t('recentActivitiesSubtitle')}
              </h2>
            </div>
            <Link
              href="/activities?status=completed"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>{t('allActivities')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedActivities.slice(0, 3).map((act) => (
              <div
                key={act._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 flex flex-col group transition-all"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      act.coverImage ||
                      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                    {act.category || 'Completed Event'}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md shadow">
                    Conducted
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Conducted on {act.date}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                      {act.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {act.description}
                    </p>

                    {act.results && (
                      <div className="bg-emerald-50/70 p-2.5 rounded-lg text-xs text-emerald-800 mb-3 border border-emerald-100">
                        <span className="font-semibold">Highlights: </span>
                        {act.results}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {act.images?.length ? `${act.images.length} Photos` : 'Photo Gallery'}
                    </span>
                    <Link
                      href={`/activities/${act.slug || act._id}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group-hover:underline"
                    >
                      {t('viewDetails')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Explore Our School / Virtual Tour Preview */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                {t('facilitiesTitle')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                {t('facilitiesSubtitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Every space is organized to offer our students safety, curiosity, hygiene, and growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.slice(0, 6).map((fac) => (
                <div
                  key={fac._id}
                  className="bg-slate-800/90 rounded-2xl overflow-hidden border border-slate-700/80 flex flex-col group hover:border-amber-400/50 transition-all hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={
                        fac.coverImage ||
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <h3 className="absolute bottom-3 left-3 text-white font-bold text-base drop-shadow-md">
                      {fac.name}
                    </h3>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                        {fac.description}
                      </p>

                      {fac.features?.length > 0 && (
                        <div className="space-y-1 mb-4">
                          {fac.features.slice(0, 2).map((feat: string, fIdx: number) => (
                            <div key={fIdx} className="flex items-center text-xs text-amber-300">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-400" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-700/70 flex items-center justify-between">
                      <button
                        onClick={() =>
                          openLightbox(
                            (fac.images?.length ? fac.images : [fac.coverImage]).map(
                              (img: string) => ({ src: img, title: fac.name })
                            )
                          )
                        }
                        className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Quick Photos
                      </button>
                      <Link
                        href={`/school/facilities/${fac.slug || fac._id}`}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group-hover:underline"
                      >
                        {t('exploreArea')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/school/facilities"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
              >
                <span>Explore Full Campus Facilities</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* 8. Principal Message */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Principal Photo & Identity */}
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl mb-4">
                  <img
                    src={
                      principal?.photo ||
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={principal?.name || 'Principal'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-white">{principal?.name}</h3>
                <span className="text-xs text-amber-300 font-medium">
                  {principal?.designation || 'Headmaster / Principal'}
                </span>
                <span className="text-xs text-slate-300 mt-1 block">
                  Prathmik Vidyalaya Kareli Bagh
                </span>
              </div>

              {/* Message Content */}
              <div className="lg:col-span-8 space-y-5">
                <div>
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    {t('principalHeading')}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    “Empowering Every Child to Dream & Learn”
                  </h2>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold text-amber-300 mb-1">
                    {t('messageStudentsHeading')}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    “{principal?.messageStudents ||
                      'Dear children, come to school every day with curiosity and kindness. Every day is an opportunity to learn something new.'}”
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold text-amber-300 mb-1">
                    {t('messageParentsHeading')}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    “{principal?.messageParents ||
                      'Respected parents, your partnership is the cornerstone of your child’s growth. Together, we can nurture their highest potential.'}”
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/principal"
                    className="inline-flex items-center text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 gap-1.5"
                  >
                    <span>{t('viewPrincipalProfile')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Teachers Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
                  {t('teachersHeading')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {t('teachersSubheading')}
                </h2>
              </div>
              <Link
                href="/teachers"
                className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                <span>{t('allTeachers')}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.slice(0, 4).map((tch) => (
                <div
                  key={tch._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 text-center p-5 flex flex-col items-center group transition-all"
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-blue-100 shadow-sm group-hover:scale-105 transition-transform">
                    <img
                      src={
                        tch.photo ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={tch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                    {tch.name}
                  </h3>
                  <span className="text-xs text-blue-700 font-medium block mt-0.5">
                    {tch.designation}
                  </span>

                  {tch.subject && (
                    <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      {tch.subject}
                    </span>
                  )}

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {tch.biography}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 w-full">
                    <Link
                      href={`/teachers/${tch.slug || tch._id}`}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1"
                    >
                      {t('viewTeacherProfile')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. School Team / Staff */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-emerald-700 font-semibold text-xs tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {t('staffHeading')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {t('staffSubheading')}
              </h2>
            </div>
            <Link
              href="/staff"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>{t('allStaff')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.slice(0, 4).map((st) => (
              <div
                key={st._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img
                    src={
                      st.photo ||
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={st.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{st.name}</h3>
                  <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
                    {st.role}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{st.category}</span>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{st.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 11. Latest Announcements */}
        <section className="py-16 bg-amber-50/40 border-y border-amber-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-amber-800 font-semibold text-xs tracking-wider uppercase bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  {t('announcementsHeading')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {t('announcementsSubheading')}
                </h2>
              </div>
              <Link
                href="/announcements"
                className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-amber-800 hover:text-amber-900"
              >
                <span>{t('allAnnouncements')}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.slice(0, 4).map((ann) => (
                <div
                  key={ann._id}
                  className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md ${
                    ann.pinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {ann.date}
                      </span>
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Pin className="w-3 h-3 text-amber-700" />
                          {t('pinnedNotice')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-2">{ann.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {ann.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Basic Education Notice</span>
                    <Link
                      href={`/announcements/${ann.slug || ann._id}`}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      Read Notice
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Photo Gallery Preview */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {t('galleryHeading')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {t('gallerySubheading')}
              </h2>
            </div>
            <Link
              href="/gallery"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              <span>{t('viewAllPhotos')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.slice(0, 8).map((item, idx) => (
              <div
                key={item._id}
                onClick={() =>
                  openLightbox(
                    gallery.map((g) => ({
                      src: g.image,
                      title: g.title,
                      caption: g.caption,
                    })),
                    idx
                  )
                }
                className="group relative h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-semibold truncate">{item.title}</span>
                  <span className="text-[11px] text-amber-300">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 13. Contact & Map */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {t('contactHeading')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {t('contactSubheading')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Card */}
              <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {schoolInfo?.schoolName || 'Prathmik Vidyalaya Kareli Bagh'}
                  </h3>
                  <p className="text-xs text-slate-500">Prayagraj, Uttar Pradesh</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{t('schoolAddressLabel')}</span>
                      <span className="text-slate-600">{schoolInfo?.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{t('schoolPhoneLabel')}</span>
                      <span className="text-slate-600">{schoolInfo?.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{t('schoolEmailLabel')}</span>
                      <span className="text-slate-600">{schoolInfo?.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 block">{t('schoolTimingsLabel')}</span>
                      <span className="text-slate-600">{schoolInfo?.timings}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={schoolInfo?.mapUrl || 'https://maps.google.com/?q=Kareli+Bagh+Prayagraj+Uttar+Pradesh'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow transition-colors gap-2"
                  >
                    <span>{t('getDirectionsBtn')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Embedded Google Map Preview */}
              <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[320px] bg-slate-100">
                <iframe
                  title="School Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14413.38883641042!2d81.8262!3d25.4358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca431ef263d9%3A0x868b444b79b294e!2sKareli%2C%20Prayagraj%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '340px' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 14. Footer */}
      <Footer />

      {/* Lightbox Modal */}
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
