'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Menu,
  X,
  Search,
  Globe,
  Lock,
  GraduationCap,
  Calendar,
  Building2,
  Users,
  Image as ImageIcon,
  Bell,
  Info,
  PhoneCall,
} from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t('navHome'), icon: GraduationCap },
    { href: '/activities', label: t('navActivities'), icon: Calendar },
    { href: '/school/facilities', label: t('navSchool'), icon: Building2 },
    { href: '/teachers', label: t('navTeachers'), icon: Users },
    { href: '/gallery', label: t('navGallery'), icon: ImageIcon },
    { href: '/announcements', label: t('navAnnouncements'), icon: Bell },
    { href: '/about', label: t('navAbout'), icon: Info },
    { href: '/contact', label: t('navContact'), icon: PhoneCall },
  ];

  return (
    <>
      {/* Top Notification / Utility Bar */}
      <div className="bg-school-primaryDark text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">
              Prayagraj, Uttar Pradesh • {t('schoolName')}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-full px-2 py-0.5 border border-white/20 text-xs">
              <Globe className="w-3.5 h-3.5 mr-1 text-amber-300" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-amber-400 text-slate-900 font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                English
              </button>
              <span className="text-white/40 mx-0.5">|</span>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                  language === 'hi'
                    ? 'bg-amber-400 text-slate-900 font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Admin Portal Quick Link */}
            <Link
              href="/admin/login"
              className="flex items-center text-slate-300 hover:text-amber-300 transition-colors font-medium text-xs"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              <span>{t('navAdmin')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled ? 'bg-white shadow-md py-2.5' : 'bg-white/95 backdrop-blur-md py-3.5 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & School Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="block font-bold text-slate-900 text-base sm:text-lg leading-tight group-hover:text-blue-700 transition-colors">
                {t('schoolName')}
              </span>
              <span className="block text-xs font-medium text-slate-500">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Global Search Button */}
            <Link
              href="/search"
              aria-label="Search"
              className="p-2 ml-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/search"
              aria-label="Search school website"
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown / Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3 text-blue-600" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/admin/login"
                className="flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700"
              >
                <Lock className="w-3.5 h-3.5 mr-2" />
                {t('navAdmin')}
              </Link>

              {/* Language Switcher on mobile */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded ${
                    language === 'en' ? 'bg-white shadow text-blue-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded ${
                    language === 'hi' ? 'bg-white shadow text-blue-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
