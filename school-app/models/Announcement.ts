import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  slug: string;
  description: string;
  image?: string;
  date: string; // YYYY-MM-DD
  pinned: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    date: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
