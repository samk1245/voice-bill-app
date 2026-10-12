'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  GraduationCap,
  Eye,
  Target,
  Heart,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/school-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSchoolInfo(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Institutional Profile
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              About Prathmik Vidyalaya Kareli Bagh
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Fostering foundational literacy, numeracy, hygiene, and joyful learning in Prayagraj, Uttar Pradesh.
            </p>
          </div>

          {/* Intro Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-blue-800">
              <GraduationCap className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                School Background & Philosophy
              </h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {schoolInfo?.introduction ||
                'Prathmik Vidyalaya Kareli Bagh is a primary educational institution focused on child-centric learning, moral development, and foundational literacy.'}
            </p>
          </div>

          {/* Vision & Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-8 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {schoolInfo?.vision ||
                  'To nurture every child’s potential through experiential learning, positive values, strong literacy, numeracy skills, and inclusive community engagement.'}
              </p>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-8 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {schoolInfo?.mission ||
                  'To foster a safe, clean, welcoming, and inspiring educational environment where every student thrives with curiosity, respect, and confidence.'}
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-amber-600" />
              Our Guiding Values & Principles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(schoolInfo?.values || [
                'Child-Centric Learning',
                'Clean, Safe & Green Campus',
                'Values & Community Respect',
                'Holistic Mind & Body Development',
                'Equal Opportunity for All Learners',
              ]).map((val: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Environment & Community */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-blue-700 font-bold text-base">
                <Compass className="w-5 h-5" />
                Joyful Learning Environment
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our classrooms are arranged to encourage curiosity, peer interaction, storytelling, and experiential activity. Teachers incorporate Teaching-Learning Materials (TLM), wall paintings, and audio-visual cues to make reading and basic mathematics accessible and fun.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-emerald-700 font-bold text-base">
                <Users className="w-5 h-5" />
                Community & Parent Partnership
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We believe that education flourishes when parents and teachers work hand in hand. Through regular Parent-Teacher Meetings (PTMs) and Village Education Committee dialogues, our school maintains open communication with the neighborhood community.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
