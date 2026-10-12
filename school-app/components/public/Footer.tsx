'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { GraduationCap, MapPin, Clock, Mail, Phone, ChevronRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">
                  {t('schoolName')}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  {t('schoolLocation')}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              A foundational primary learning school committed to child-centric pedagogy, holistic development, joyful learning, and positive community engagement.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Basic Education Department, Uttar Pradesh
              </span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { href: '/', label: t('navHome') },
                { href: '/about', label: t('navAbout') },
                { href: '/activities', label: t('navActivities') },
                { href: '/school/facilities', label: t('navSchool') },
                { href: '/teachers', label: t('navTeachers') },
                { href: '/staff', label: t('navStaff') },
                { href: '/gallery', label: t('navGallery') },
                { href: '/announcements', label: t('navAnnouncements') },
                { href: '/contact', label: t('navContact') },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-amber-400 flex items-center transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Important Hours & Info */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
              Working Hours
            </h4>
            <div className="flex items-start gap-3 text-xs">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-200 font-medium">Class Timings</span>
                <span className="text-slate-400">Monday – Saturday: 8:00 AM – 2:00 PM</span>
                <span className="block text-slate-500 mt-0.5">Sunday & Gazetted Holidays Closed</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs pt-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-200 font-medium">Campus Location</span>
                <span className="text-slate-400">
                  Kareli Bagh, Prayagraj, Uttar Pradesh 211016, India
                </span>
                <a
                  href="https://maps.google.com/?q=Kareli+Bagh+Prayagraj+Uttar+Pradesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-blue-400 hover:text-blue-300 underline text-xs"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Notice */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
              School Communication
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>info@karelibagh.edu.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>School Contact — Update from Admin</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Notice to Parents:</span>
              For admissions, mid-day meal queries, or student progress discussions, please visit during school office hours.
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>
            © {new Date().getFullYear()} {t('schoolName')}, Prayagraj. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="hover:text-slate-400 transition-colors">
              About School
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              Contact Office
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-amber-400 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
