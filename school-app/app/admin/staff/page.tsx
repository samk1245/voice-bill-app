'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  AlertTriangle,
  Filter,
} from 'lucide-react';

const CATEGORIES = [
  'Administrative Staff',
  'Support Staff',
  'Kitchen Staff',
  'Maintenance Staff',
  'Other Workers',
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    role: '',
    category: 'Kitchen Staff',
    photo: '',
    description: '',
    displayOrder: 0,
    published: true,
  });

  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [categoryFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('all', 'true');
      if (categoryFilter !== 'All') params.set('category', categoryFilter);

      const res = await fetch(`/api/staff?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
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
      name: '',
      role: '',
      category: 'Kitchen Staff',
      photo: '',
      description: '',
      displayOrder: staff.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setCurrentId(item._id);
    setForm({
      name: item.name || '',
      role: item.role || '',
      category: item.category || 'Kitchen Staff',
      photo: item.photo || '',
      description: item.description || '',
      displayOrder: item.displayOrder ?? 0,
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
      formData.append('folder', 'staff');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchStaff();
        }
      } else if (currentId) {
        const res = await fetch(`/api/staff/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchStaff();
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
      const res = await fetch(`/api/staff/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchStaff();
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
          <h1 className="text-2xl font-extrabold text-slate-900">School Team & Staff</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage mid-day meal cooks, caretakers, maintenance and student support staff.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
              categoryFilter === cat
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Loading staff...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <UserCog className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-medium">No staff members listed for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((st) => (
            <div
              key={st._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={
                      st.photo ||
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                    {st.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{st.name}</h3>
                  <span className="text-xs text-slate-500 block">{st.role}</span>
                </div>
              </div>

              {st.description && (
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {st.description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Order: {st.displayOrder}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1.5 hover:bg-slate-100 text-blue-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(st._id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scaleUp my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'create' ? 'Add Staff Member' : 'Edit Staff'}
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
                <label className="block font-bold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Mid-Day Meal Cook / Campus Caretaker"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photograph</label>
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
                  <div className="mt-2 w-14 h-14 rounded-xl overflow-hidden border border-slate-200">
                    <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Responsibilities and key contributions..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="stPub"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="stPub" className="font-semibold text-slate-700">
                    Visible on Website
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
                  Save Staff
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
            <h3 className="font-extrabold text-slate-900 text-base">Delete Staff Member?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this staff profile?
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
