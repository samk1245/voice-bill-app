'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  UserCheck,
  UserCog,
  Camera,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navSections = [
    {
      label: 'Main',
      links: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Activities',
      links: [
        { href: '/admin/activities', label: 'All Activities', icon: Calendar },
      ],
    },
    {
      label: 'School Campus',
      links: [
        { href: '/admin/school-info', label: 'School Information', icon: Building2 },
        { href: '/admin/facilities', label: 'Campus Facilities', icon: Sparkles },
        { href: '/admin/principal', label: 'Principal Profile', icon: UserCheck },
      ],
    },
    {
      label: 'People',
      links: [
        { href: '/admin/teachers', label: 'Teachers', icon: Users },
        { href: '/admin/staff', label: 'School Team & Staff', icon: UserCog },
      ],
    },
    {
      label: 'Media & Notices',
      links: [
        { href: '/admin/gallery', label: 'Photo Gallery', icon: Camera },
        { href: '/admin/announcements', label: 'Announcements', icon: Bell },
      ],
    },
    {
      label: 'System',
      links: [
        { href: '/admin/settings', label: 'Settings & Data', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header branding */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm leading-tight">Admin Portal</h1>
                <span className="text-[11px] text-amber-300 block">Kareli Bagh School</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3">
                  {section.label}
                </span>
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Website
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
