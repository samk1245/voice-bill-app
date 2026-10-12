import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  status: 'upcoming' | 'completed';
  coverImage?: string;
  images: string[];
  objectives?: string;
  participation?: string;
  results?: string;
  teachersInvolved: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    location: { type: String, default: 'School Campus' },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
    coverImage: { type: String, default: '' },
    images: [{ type: String }],
    objectives: { type: String, default: '' },
    participation: { type: String, default: '' },
    results: { type: String, default: '' },
    teachersInvolved: [{ type: String }],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
