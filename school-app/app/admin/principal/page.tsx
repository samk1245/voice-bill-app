'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AdminPrincipalPage() {
  const [form, setForm] = useState({
    name: '',
    photo: '',
    designation: 'Headmaster / Principal',
    biography: '',
    education: '',
    experience: '',
    messageStudents: '',
    messageParents: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/principal')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            name: data.name || '',
            photo: data.photo || '',
            designation: data.designation || 'Headmaster / Principal',
            biography: data.biography || '',
            education: data.education || '',
            experience: data.experience || '',
            messageStudents: data.messageStudents || '',
            messageParents: data.messageParents || '',
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
      formData.append('folder', 'principal');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, photo: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/principal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccessMsg('Principal profile updated successfully.');
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
        <h1 className="text-2xl font-extrabold text-slate-900">Principal Profile & Messages</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update the Headmaster / Principal name, biography, educational qualifications, and messages for students and parents.
        </p>
      </div>

      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Important Guideline:</strong> Enter official and verified information for the Headmaster/Principal. If details are not yet finalized, keep clearly marked placeholders.
        </span>
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
          <p className="text-xs">Loading profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Principal Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Smt. Asha Srivastava"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="Headmaster / Principal"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
          </div>

          {/* Photograph Upload */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Principal Photograph</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
              {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
            </div>
            {form.photo && (
              <div className="mt-2 w-20 h-20 rounded-2xl overflow-hidden border border-slate-200">
                <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Principal Biography</label>
            <textarea
              rows={4}
              value={form.biography}
              onChange={(e) => setForm({ ...form, biography: e.target.value })}
              placeholder="Background, educational vision, and leadership at Prathmik Vidyalaya Kareli Bagh..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Educational Background</label>
              <input
                type="text"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                placeholder="e.g. M.A., B.Ed., Basic Education Certified"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Experience</label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g. 15+ years in primary education administration"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Message for Students</label>
            <textarea
              rows={3}
              value={form.messageStudents}
              onChange={(e) => setForm({ ...form, messageStudents: e.target.value })}
              placeholder="Inspiring words for primary school students..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Message for Parents & Guardians</label>
            <textarea
              rows={3}
              value={form.messageParents}
              onChange={(e) => setForm({ ...form, messageParents: e.target.value })}
              placeholder="Message encouraging parent-teacher partnership..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition-colors shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Principal Information'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
