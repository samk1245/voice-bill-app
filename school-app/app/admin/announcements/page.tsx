'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Pin,
  AlertTriangle,
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    pinned: false,
    published: true,
  });

  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/announcements?all=true');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setCurrentId(null);
    setForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      pinned: false,
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setCurrentId(item._id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      date: item.date || '',
      image: item.image || '',
      pinned: item.pinned ?? false,
      published: item.published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'announcements');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      } else if (currentId) {
        const res = await fetch(`/api/announcements/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async (item: any) => {
    try {
      await fetch(`/api/announcements/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !item.pinned }),
      });
      fetchAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/announcements/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">School Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Post and pin important circulars, admission notices, and school circulars.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Loading circulars...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-medium">No announcements published.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col sm:flex-row gap-4 items-start justify-between transition-all ${
                ann.pinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="space-y-1.5 flex-grow">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">{ann.date}</span>
                  {ann.pinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 text-amber-700" />
                      Pinned on Homepage
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      ann.published !== false
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {ann.published !== false ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {ann.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                <button
                  onClick={() => handleTogglePin(ann)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    ann.pinned
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={ann.pinned ? 'Unpin from homepage' : 'Pin to top of homepage'}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{ann.pinned ? 'Pinned' : 'Pin'}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-2 hover:bg-slate-100 text-blue-700 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteId(ann._id)}
                  className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scaleUp my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'create' ? 'Post New Announcement' : 'Edit Announcement'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Admissions Open for Academic Session 2026-27"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Notice *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Circular Body *</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of the announcement, required documents, timings..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Image / Attachment</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                  />
                  {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
                </div>
                {form.image && (
                  <div className="mt-2 relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinChk"
                    checked={form.pinned}
                    onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <label htmlFor="pinChk" className="font-semibold text-slate-700">
                    Pin notice prominently at top of homepage
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pubChk"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="pubChk" className="font-semibold text-slate-700">
                    Publish publicly
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Delete Notice?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this announcement?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
