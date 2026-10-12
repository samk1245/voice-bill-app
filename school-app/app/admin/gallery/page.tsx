'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Filter,
  Plus,
  X,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  'School',
  'Classrooms',
  'Activities',
  'Events',
  'Teachers',
  'Students',
  'Garden',
  'Kitchen',
  'Playground',
  'Celebrations',
  'Other',
];

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('School');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      const res = await fetch(`/api/gallery?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'gallery');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
        return;
      }

      setUploadedUrl(data.url);
      if (!uploadTitle) {
        // clean filename default title
        const clean = file.name.split('.')[0].replace(/[^a-zA-Z0-9 ]/g, ' ');
        setUploadTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedUrl) {
      setUploadError('Please choose a photo to upload');
      return;
    }

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedUrl,
          title: uploadTitle,
          caption: uploadCaption,
          category: uploadCategory,
          date: uploadDate,
        }),
      });

      if (res.ok) {
        setIsUploadOpen(false);
        setUploadedUrl('');
        setUploadTitle('');
        setUploadCaption('');
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/gallery?id=${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchGallery();
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
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Photo Gallery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload campus photographs, student activities, sports, and celebrations.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadedUrl('');
            setUploadTitle('');
            setUploadCaption('');
            setUploadError('');
            setIsUploadOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium ${
              selectedCategory === cat
                ? 'bg-purple-700 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Loading photographs...</p>
        </div>
      ) : gallery.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Camera className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-medium">No images uploaded for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between group"
            >
              <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.category}
                </div>
              </div>

              <div className="p-3 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                {item.caption && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.caption}</p>
                )}
                {item.date && (
                  <span className="text-[10px] text-slate-400 block pt-0.5">{item.date}</span>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setDeleteId(item._id)}
                  className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scaleUp my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Upload Gallery Image</h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    required={!uploadedUrl}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                  />
                  {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
                </div>
                {uploadError && <p className="text-xs text-rose-600 mt-1">{uploadError}</p>}
                {uploadedUrl && (
                  <div className="mt-2 relative h-36 rounded-xl overflow-hidden border border-slate-200">
                    <img src={uploadedUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
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
                <label className="block font-bold text-slate-700 mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Science Model Demonstration"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Photograph</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Description</label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Brief note about the picture..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadedUrl}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  Save Photo to Gallery
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
            <h3 className="font-extrabold text-slate-900 text-base">Delete Photo?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this image from the school gallery?
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
