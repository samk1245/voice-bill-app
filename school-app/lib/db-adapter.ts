import fs from 'fs';
import path from 'path';
import { connectDB, isUsingFallback } from './db';
import { Activity } from '@/models/Activity';
import { Teacher } from '@/models/Teacher';
import { Staff } from '@/models/Staff';
import { Facility } from '@/models/Facility';
import { Announcement } from '@/models/Announcement';
import { Gallery } from '@/models/Gallery';
import { Principal } from '@/models/Principal';
import { SchoolInfo } from '@/models/SchoolInfo';
import { AdminUser } from '@/models/AdminUser';
import { getInitialSeedData } from './seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'db_local.json');

export interface DatabaseState {
  activities: any[];
  teachers: any[];
  staff: any[];
  facilities: any[];
  announcements: any[];
  gallery: any[];
  principal: any;
  schoolInfo: any;
  adminUsers: any[];
}

function ensureLocalFile(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const initialData = getInitialSeedData();
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const initialData = getInitialSeedData();
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveLocalState(state: DatabaseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export const dbAdapter = {
  // Reset / Seed data
  async resetOrSeed(newData?: DatabaseState) {
    const data = newData || getInitialSeedData();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Activity.deleteMany({});
        await Teacher.deleteMany({});
        await Staff.deleteMany({});
        await Facility.deleteMany({});
        await Announcement.deleteMany({});
        await Gallery.deleteMany({});
        await Principal.deleteMany({});
        await SchoolInfo.deleteMany({});
        await AdminUser.deleteMany({});

        if (data.activities?.length) await Activity.insertMany(data.activities);
        if (data.teachers?.length) await Teacher.insertMany(data.teachers);
        if (data.staff?.length) await Staff.insertMany(data.staff);
        if (data.facilities?.length) await Facility.insertMany(data.facilities);
        if (data.announcements?.length) await Announcement.insertMany(data.announcements);
        if (data.gallery?.length) await Gallery.insertMany(data.gallery);
        if (data.principal) await Principal.create(data.principal);
        if (data.schoolInfo) await SchoolInfo.create(data.schoolInfo);
        if (data.adminUsers?.length) await AdminUser.insertMany(data.adminUsers);
      } catch (err) {
        console.error('Error seeding MongoDB:', err);
      }
    }
    saveLocalState(data);
    return data;
  },

  // Activities
  async getActivities(filter: { status?: string; category?: string; search?: string; publishedOnly?: boolean } = {}) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const query: any = {};
        if (filter.publishedOnly) query.published = true;
        if (filter.status) query.status = filter.status;
        if (filter.category && filter.category !== 'All') query.category = filter.category;
        if (filter.search) {
          query.$or = [
            { title: { $regex: filter.search, $options: 'i' } },
            { description: { $regex: filter.search, $options: 'i' } },
          ];
        }
        return await Activity.find(query).sort({ date: -1 }).lean();
      } catch (e) {
        console.warn('MongoDB query failed, reading local store', e);
      }
    }

    const state = ensureLocalFile();
    let list = [...state.activities];
    if (filter.publishedOnly) list = list.filter((a) => a.published !== false);
    if (filter.status) list = list.filter((a) => a.status === filter.status);
    if (filter.category && filter.category !== 'All') list = list.filter((a) => a.category === filter.category);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      list = list.filter((a) => a.title?.toLowerCase().includes(s) || a.description?.toLowerCase().includes(s));
    }
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  },

  async getActivityBySlug(slug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Activity.findOne({ slug }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn('MongoDB query failed', e);
      }
    }
    const state = ensureLocalFile();
    return state.activities.find((a) => a.slug === slug || a._id === slug) || null;
  },

  async createActivity(data: any) {
    const item = {
      _id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      published: data.published ?? true,
      images: data.images || [],
      teachersInvolved: data.teachersInvolved || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Activity.create(item);
        return doc.toObject();
      } catch (e) {
        console.warn('MongoDB create failed', e);
      }
    }
    const state = ensureLocalFile();
    state.activities.unshift(item);
    saveLocalState(state);
    return item;
  },

  async updateActivity(idOrSlug: string, updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Activity.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          updates,
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn('MongoDB update failed', e);
      }
    }
    const state = ensureLocalFile();
    const idx = state.activities.findIndex((a) => a._id === idOrSlug || a.slug === idOrSlug);
    if (idx !== -1) {
      state.activities[idx] = { ...state.activities[idx], ...updates };
      saveLocalState(state);
      return state.activities[idx];
    }
    return null;
  },

  async deleteActivity(idOrSlug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Activity.deleteOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
      } catch (e) {
        console.warn('MongoDB delete failed', e);
      }
    }
    const state = ensureLocalFile();
    state.activities = state.activities.filter((a) => a._id !== idOrSlug && a.slug !== idOrSlug);
    saveLocalState(state);
    return true;
  },

  // Facilities
  async getFacilities(publishedOnly = false) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const q = publishedOnly ? { published: true } : {};
        return await Facility.find(q).sort({ displayOrder: 1, createdAt: 1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    let list = [...state.facilities];
    if (publishedOnly) list = list.filter((f) => f.published !== false);
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getFacilityBySlug(slug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Facility.findOne({ slug }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    return state.facilities.find((f) => f.slug === slug || f._id === slug) || null;
  },

  async createFacility(data: any) {
    const item = {
      _id: 'fac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      images: data.images || [],
      features: data.features || [],
      displayOrder: data.displayOrder || 0,
      published: data.published ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Facility.create(item);
        return doc.toObject();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.facilities.push(item);
    saveLocalState(state);
    return item;
  },

  async updateFacility(idOrSlug: string, updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Facility.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          updates,
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    const idx = state.facilities.findIndex((f) => f._id === idOrSlug || f.slug === idOrSlug);
    if (idx !== -1) {
      state.facilities[idx] = { ...state.facilities[idx], ...updates };
      saveLocalState(state);
      return state.facilities[idx];
    }
    return null;
  },

  async deleteFacility(idOrSlug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Facility.deleteOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.facilities = state.facilities.filter((f) => f._id !== idOrSlug && f.slug !== idOrSlug);
    saveLocalState(state);
    return true;
  },

  // Teachers
  async getTeachers(publishedOnly = false) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const q = publishedOnly ? { published: true } : {};
        return await Teacher.find(q).sort({ displayOrder: 1, createdAt: 1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    let list = [...state.teachers];
    if (publishedOnly) list = list.filter((t) => t.published !== false);
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getTeacherBySlug(slug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Teacher.findOne({ slug }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    return state.teachers.find((t) => t.slug === slug || t._id === slug) || null;
  },

  async createTeacher(data: any) {
    const item = {
      _id: 'tch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      displayOrder: data.displayOrder || 0,
      published: data.published ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Teacher.create(item);
        return doc.toObject();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.teachers.push(item);
    saveLocalState(state);
    return item;
  },

  async updateTeacher(idOrSlug: string, updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Teacher.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          updates,
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    const idx = state.teachers.findIndex((t) => t._id === idOrSlug || t.slug === idOrSlug);
    if (idx !== -1) {
      state.teachers[idx] = { ...state.teachers[idx], ...updates };
      saveLocalState(state);
      return state.teachers[idx];
    }
    return null;
  },

  async deleteTeacher(idOrSlug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Teacher.deleteOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.teachers = state.teachers.filter((t) => t._id !== idOrSlug && t.slug !== idOrSlug);
    saveLocalState(state);
    return true;
  },

  // Staff
  async getStaff(publishedOnly = false, category?: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const q: any = {};
        if (publishedOnly) q.published = true;
        if (category && category !== 'All') q.category = category;
        return await Staff.find(q).sort({ displayOrder: 1, createdAt: 1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    let list = [...state.staff];
    if (publishedOnly) list = list.filter((s) => s.published !== false);
    if (category && category !== 'All') list = list.filter((s) => s.category === category);
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async createStaff(data: any) {
    const item = {
      _id: 'stf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      displayOrder: data.displayOrder || 0,
      published: data.published ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Staff.create(item);
        return doc.toObject();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.staff.push(item);
    saveLocalState(state);
    return item;
  },

  async updateStaff(idOrSlug: string, updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Staff.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          updates,
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    const idx = state.staff.findIndex((s) => s._id === idOrSlug || s.slug === idOrSlug);
    if (idx !== -1) {
      state.staff[idx] = { ...state.staff[idx], ...updates };
      saveLocalState(state);
      return state.staff[idx];
    }
    return null;
  },

  async deleteStaff(idOrSlug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Staff.deleteOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.staff = state.staff.filter((s) => s._id !== idOrSlug && s.slug !== idOrSlug);
    saveLocalState(state);
    return true;
  },

  // Announcements
  async getAnnouncements(publishedOnly = false) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const q = publishedOnly ? { published: true } : {};
        return await Announcement.find(q).sort({ pinned: -1, date: -1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    let list = [...state.announcements];
    if (publishedOnly) list = list.filter((a) => a.published !== false);
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return (b.date || '').localeCompare(a.date || '');
    });
  },

  async getAnnouncementBySlug(slug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Announcement.findOne({ slug }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    return state.announcements.find((a) => a.slug === slug || a._id === slug) || null;
  },

  async createAnnouncement(data: any) {
    const item = {
      _id: 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      pinned: data.pinned ?? false,
      published: data.published ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Announcement.create(item);
        return doc.toObject();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.announcements.unshift(item);
    saveLocalState(state);
    return item;
  },

  async updateAnnouncement(idOrSlug: string, updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Announcement.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          updates,
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    const idx = state.announcements.findIndex((a) => a._id === idOrSlug || a.slug === idOrSlug);
    if (idx !== -1) {
      state.announcements[idx] = { ...state.announcements[idx], ...updates };
      saveLocalState(state);
      return state.announcements[idx];
    }
    return null;
  },

  async deleteAnnouncement(idOrSlug: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Announcement.deleteOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.announcements = state.announcements.filter((a) => a._id !== idOrSlug && a.slug !== idOrSlug);
    saveLocalState(state);
    return true;
  },

  // Gallery
  async getGallery(category?: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const q = category && category !== 'All' ? { category } : {};
        return await Gallery.find(q).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    let list = [...state.gallery];
    if (category && category !== 'All') list = list.filter((g) => g.category === category);
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async createGalleryItem(data: any) {
    const item = {
      _id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      ...data,
    };
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Gallery.create(item);
        return doc.toObject();
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.gallery.unshift(item);
    saveLocalState(state);
    return item;
  },

  async deleteGalleryItem(id: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await Gallery.deleteOne({ _id: id });
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.gallery = state.gallery.filter((g) => g._id !== id);
    saveLocalState(state);
    return true;
  },

  // Principal
  async getPrincipal() {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Principal.findOne().lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    return state.principal;
  },

  async updatePrincipal(updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await Principal.findOneAndUpdate({}, updates, { upsert: true, new: true }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.principal = { ...state.principal, ...updates };
    saveLocalState(state);
    return state.principal;
  },

  // School Information
  async getSchoolInfo() {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await SchoolInfo.findOne().lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    return state.schoolInfo;
  },

  async updateSchoolInfo(updates: any) {
    updates.updatedAt = new Date().toISOString();
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await SchoolInfo.findOneAndUpdate({}, updates, { upsert: true, new: true }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    state.schoolInfo = { ...state.schoolInfo, ...updates };
    saveLocalState(state);
    return state.schoolInfo;
  },

  // Admin User
  async findAdminByEmail(email: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        const doc = await AdminUser.findOne({ email: email.toLowerCase() }).lean();
        if (doc) return doc;
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    return state.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async updateAdminPassword(email: string, newPasswordHash: string) {
    const { isFallback } = await connectDB();
    if (!isFallback) {
      try {
        await AdminUser.updateOne({ email: email.toLowerCase() }, { passwordHash: newPasswordHash });
      } catch (e) {
        console.warn(e);
      }
    }
    const state = ensureLocalFile();
    const user = state.adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.passwordHash = newPasswordHash;
      saveLocalState(state);
    }
    return true;
  },

  // Global Search
  async searchAll(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { activities: [], teachers: [], staff: [], facilities: [], announcements: [], gallery: [] };

    const [activities, teachers, staff, facilities, announcements, gallery] = await Promise.all([
      this.getActivities({ search: q, publishedOnly: true }),
      this.getTeachers(true),
      this.getStaff(true),
      this.getFacilities(true),
      this.getAnnouncements(true),
      this.getGallery(),
    ]);

    return {
      activities: activities.filter((a: any) =>
        a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q)
      ),
      teachers: teachers.filter((t: any) =>
        t.name?.toLowerCase().includes(q) || t.designation?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q)
      ),
      staff: staff.filter((s: any) =>
        s.name?.toLowerCase().includes(q) || s.role?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)
      ),
      facilities: facilities.filter((f: any) =>
        f.name?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q) || f.features?.some((feat: string) => feat.toLowerCase().includes(q))
      ),
      announcements: announcements.filter((a: any) =>
        a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
      ),
      gallery: gallery.filter((g: any) =>
        g.title?.toLowerCase().includes(q) || g.caption?.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)
      ),
    };
  },

  // Metrics for Admin Dashboard
  async getDashboardMetrics() {
    const [activities, teachers, staff, facilities, gallery, announcements] = await Promise.all([
      this.getActivities(),
      this.getTeachers(),
      this.getStaff(),
      this.getFacilities(),
      this.getGallery(),
      this.getAnnouncements(),
    ]);

    const upcomingCount = activities.filter((a: any) => a.status === 'upcoming').length;
    const completedCount = activities.filter((a: any) => a.status === 'completed').length;

    return {
      totalActivities: activities.length,
      upcomingActivities: upcomingCount,
      completedActivities: completedCount,
      teachers: teachers.length,
      staff: staff.length,
      facilities: facilities.length,
      galleryImages: gallery.length,
      announcements: announcements.length,
      recentActivities: activities.slice(0, 5),
    };
  },
};
