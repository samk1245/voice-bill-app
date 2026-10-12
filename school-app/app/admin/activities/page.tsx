'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
} from 'lucide-react';

export default function AdminActivitiesPage() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form fields
  const [form, setForm] = useState({
    title: '',
    category: 'Sports',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: 'School Campus',
    status: 'upcoming',
    description: '',
    objectives: '',
    participation: '',
    results: '',
    teachersInvolved: '',
    coverImage: '',
    published: true,
  });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchActivities();
    if (initialAction === 'new') {
      handleOpenCreate();
    }
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?all=true');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
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
      category: 'Sports',
      date: new Date().toISOString().split('T')[0],
      time: '9:00 AM - 1:00 PM',
      location: 'School Campus',
      status: 'upcoming',
      description: '',
      objectives: '',
      participation: '',
      results: '',
      teachersInvolved: '',
      coverImage: '',
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setCurrentId(item._id);
    setForm({
      title: item.title || '',
      category: item.category || 'Sports',
      date: item.date || '',
      time: item.time || '',
      location: item.location || 'School Campus',
      status: item.status || 'upcoming',
      description: item.description || '',
      objectives: item.objectives || '',
      participation: item.participation || '',
      results: item.results || '',
      teachersInvolved: (item.teachersInvolved || []).join(', '),
      coverImage: item.coverImage || '',
      published: item.published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'activities');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
        return;
      }

      setForm((prev) => ({ ...prev, coverImage: data.url }));
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      teachersInvolved: form.teachersInvolved
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchActivities();
        }
      } else if (currentId) {
        const res = await fetch(`/api/activities/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchActivities();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/activities/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchActivities();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Activities</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, and manage upcoming and completed school events.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Activity</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or category..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">No activities found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivities.map((act) => (
                  <tr key={act._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {act.coverImage ? (
                          <img
                            src={act.coverImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {act.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block line-clamp-1">
                            {act.location || 'School Ground'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{act.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{act.date}</div>
                      {act.time && <div className="text-[11px] text-slate-400">{act.time}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          act.status === 'upcoming'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {act.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          act.published !== false
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        {act.published !== false ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(act)}
                          className="p-1.5 hover:bg-slate-100 text-blue-700 rounded-lg transition-colors"
                          title="Edit Activity"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(act._id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scaleUp my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'create' ? 'Add New School Activity' : 'Edit Activity'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Sports Meet 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
                  >
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Educational">Educational</option>
                    <option value="Environmental">Environmental</option>
                    <option value="National celebrations">National celebrations</option>
                    <option value="Competitions">Competitions</option>
                    <option value="Awareness programs">Awareness programs</option>
                    <option value="School events">School events</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
                  >
                    <option value="upcoming">Upcoming Event</option>
                    <option value="completed">Completed / Conducted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Time</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="9:00 AM - 1:00 PM"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Main Playground"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Photograph</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && (
                    <span className="text-xs text-blue-600 animate-pulse">Uploading...</span>
                  )}
                </div>
                {uploadError && <p className="text-xs text-rose-600 mt-1">{uploadError}</p>}
                {form.coverImage && (
                  <div className="mt-2 relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={form.coverImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the activity, purpose and schedule..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Learning Objectives</label>
                <input
                  type="text"
                  value={form.objectives}
                  onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                  placeholder="e.g. Promote athletic wellness and team camaraderie..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Participation</label>
                  <input
                    type="text"
                    value={form.participation}
                    onChange={(e) => setForm({ ...form, participation: e.target.value })}
                    placeholder="e.g. Classes 1 to 5, all students"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Results / Achievements</label>
                  <input
                    type="text"
                    value={form.results}
                    onChange={(e) => setForm({ ...form, results: e.target.value })}
                    placeholder="e.g. Medals awarded, 50 saplings planted"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teachers Involved (comma separated)
                </label>
                <input
                  type="text"
                  value={form.teachersInvolved}
                  onChange={(e) => setForm({ ...form, teachersInvolved: e.target.value })}
                  placeholder="e.g. Sports In-charge, Eco Club Lead"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="published" className="font-semibold text-slate-700">
                  Publish to Public School Website immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition-colors shadow"
                >
                  {modalMode === 'create' ? 'Create Activity' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Delete Activity?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this activity? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
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
