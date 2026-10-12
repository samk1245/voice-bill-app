'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  UserCog,
  Camera,
  Bell,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMetrics(data))
      .finally(() => setLoading(false));
  }, []);

  const overviewCards = [
    {
      title: 'Total Activities',
      value: metrics?.totalActivities ?? 0,
      icon: Calendar,
      color: 'bg-blue-600',
      href: '/admin/activities',
    },
    {
      title: 'Upcoming Activities',
      value: metrics?.upcomingActivities ?? 0,
      icon: Clock,
      color: 'bg-amber-600',
      href: '/admin/activities?status=upcoming',
    },
    {
      title: 'Completed Activities',
      value: metrics?.completedActivities ?? 0,
      icon: TrendingUp,
      color: 'bg-emerald-600',
      href: '/admin/activities?status=completed',
    },
    {
      title: 'Teachers',
      value: metrics?.teachers ?? 0,
      icon: Users,
      color: 'bg-indigo-600',
      href: '/admin/teachers',
    },
    {
      title: 'School Team & Staff',
      value: metrics?.staff ?? 0,
      icon: UserCog,
      color: 'bg-teal-600',
      href: '/admin/staff',
    },
    {
      title: 'Campus Facilities',
      value: metrics?.facilities ?? 0,
      icon: Sparkles,
      color: 'bg-sky-600',
      href: '/admin/facilities',
    },
    {
      title: 'Gallery Photographs',
      value: metrics?.galleryImages ?? 0,
      icon: Camera,
      color: 'bg-purple-600',
      href: '/admin/gallery',
    },
    {
      title: 'Announcements',
      value: metrics?.announcements ?? 0,
      icon: Bell,
      color: 'bg-rose-600',
      href: '/admin/announcements',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">
            Administrative Control Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            School Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Publish events, manage photographs, update staff, and maintain campus information easily.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-colors shrink-0"
        >
          <span>View Live Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 8 Overview Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Overview Metrics
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {overviewCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.href}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-blue-700 transition-colors">
                      {card.title}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl ${card.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {card.value}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Add Activity', href: '/admin/activities?action=new', icon: Calendar, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            { label: 'Add Notice', href: '/admin/announcements?action=new', icon: Bell, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
            { label: 'Add Teacher', href: '/admin/teachers?action=new', icon: Users, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
            { label: 'Add Staff', href: '/admin/staff?action=new', icon: UserCog, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
            { label: 'Add Facility', href: '/admin/facilities?action=new', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
            { label: 'Upload Photos', href: '/admin/gallery', icon: Camera, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <Link
                key={i}
                href={act.href}
                className={`p-3.5 rounded-2xl border border-slate-100 flex flex-col items-center text-center font-bold text-xs transition-colors ${act.color}`}
              >
                <Icon className="w-5 h-5 mb-1.5" />
                <span>{act.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Recently Added / Updated Activities
          </h2>
          <Link
            href="/admin/activities"
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Manage All →
          </Link>
        </div>

        {metrics?.recentActivities?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No activities recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {metrics?.recentActivities?.map((item: any) => (
              <div key={item._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.status === 'upcoming' ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                    <span className="text-slate-500">
                      {item.category} • Date: {item.date} • Status: {item.status}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/activities?edit=${item._id}`}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
