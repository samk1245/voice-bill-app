'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/school-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSchoolInfo(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      <Header />

      <main className="flex-grow py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-700 font-semibold text-xs tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Reach Out
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Contact Prathmik Vidyalaya Kareli Bagh
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              We welcome parents, guardians, and visitors. Reach out to us for admission inquiries, school schedules, and academic discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Contact Card */}
            <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="font-bold text-slate-900 text-lg mb-1">School Office</h2>
                <p className="text-xs text-slate-500">
                  Basic Education Department, Prayagraj, UP
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Campus Address</span>
                    <span className="text-slate-600">
                      {schoolInfo?.address || 'Kareli Bagh, Prayagraj, Uttar Pradesh 211016, India'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Telephone / Mobile</span>
                    <span className="text-slate-600">
                      {schoolInfo?.phone || 'School Contact — Update from Admin'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Official Email</span>
                    <span className="text-slate-600">
                      {schoolInfo?.email || 'info@karelibagh.edu.in'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Office Timings</span>
                    <span className="text-slate-600">
                      {schoolInfo?.timings || 'Monday - Saturday: 8:00 AM - 2:00 PM'}
                    </span>
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

            {/* Right Form & Map Grid */}
            <div className="lg:col-span-7 space-y-6">
              {/* Inquiry Form */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Send an Inquiry / Message
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Have a question regarding admissions or school events? Leave your note here.
                </p>

                {submitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900 text-base">Inquiry Submitted</h4>
                    <p className="text-xs text-emerald-700">
                      Thank you for contacting Prathmik Vidyalaya Kareli Bagh. We will review your message promptly.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', phone: '', email: '', message: '' });
                      }}
                      className="mt-3 text-xs font-semibold text-emerald-800 underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 9876543210"
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Message or Query</label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please write your inquiry regarding admission, uniform, or visiting hours..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Inquiry
                    </button>
                  </form>
                )}
              </div>

              {/* Map Preview */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100">
                <iframe
                  title="School Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14413.38883641042!2d81.8262!3d25.4358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca431ef263d9%3A0x868b444b79b294e!2sKareli%2C%20Prayagraj%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
