'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

export default function AdminSchoolInfoPage() {
  const [form, setForm] = useState({
    schoolName: '',
    tagline: '',
    introduction: '',
    vision: '',
    mission: '',
    values: [] as string[],
    address: '',
    phone: '',
    email: '',
    mapUrl: '',
    timings: '',
    heroImage: '',
  });

  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/school-info')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            schoolName: data.schoolName || '',
            tagline: data.tagline || '',
            introduction: data.introduction || '',
            vision: data.vision || '',
            mission: data.mission || '',
            values: data.values || [],
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            mapUrl: data.mapUrl || '',
            timings: data.timings || '',
            heroImage: data.heroImages?.[0] || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'branding');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, heroImage: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleAddValue = () => {
    if (!newValue.trim()) return;
    setForm((prev) => ({ ...prev, values: [...prev.values, newValue.trim()] }));
    setNewValue('');
  };

  const handleRemoveValue = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const payload = {
        ...form,
        heroImages: form.heroImage ? [form.heroImage] : [],
      };

      const res = await fetch('/api/school-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg('School information and branding updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">School Information & Branding</h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize the school name, tagline, address, contacts, vision, mission, and homepage hero image.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Loading school info...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          {/* Identity & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-1">School Name *</label>
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                placeholder="Prathmik Vidyalaya Kareli Bagh"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">School Subtitle / Tagline *</label>
              <input
                type="text"
                required
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Our School • Our Activities • Our Community"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Homepage Hero Photograph</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
              {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
            </div>
            {form.heroImage && (
              <div className="mt-2 relative h-36 max-w-md rounded-2xl overflow-hidden border border-slate-200">
                <img src={form.heroImage} alt="Hero preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Introduction & Overview</label>
            <textarea
              rows={4}
              value={form.introduction}
              onChange={(e) => setForm({ ...form, introduction: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vision Statement</label>
              <textarea
                rows={3}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mission Statement</label>
              <textarea
                rows={3}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* School Values Editor */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Core Values</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. Joyful Learning Environment"
                className="flex-grow p-2.5 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900"
              >
                Add Value
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.values.map((v, i) => (
                <span
                  key={i}
                  className="bg-slate-100 text-slate-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-200"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(i)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Contact & Location Information</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">School Physical Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Official contact phone"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Working Hours</label>
                <input
                  type="text"
                  value={form.timings}
                  onChange={(e) => setForm({ ...form, timings: e.target.value })}
                  placeholder="Monday - Saturday: 8:00 AM - 2:00 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Google Maps Direction URL</label>
                <input
                  type="url"
                  value={form.mapUrl}
                  onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition-colors shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save School Information'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
