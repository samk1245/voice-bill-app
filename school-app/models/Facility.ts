import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  slug: string;
  coverImage?: string;
  images: string[];
  description: string;
  features: string[];
  importance?: string;
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    coverImage: { type: String, default: '' },
    images: [{ type: String }],
    description: { type: String, required: true },
    features: [{ type: String }],
    importance: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Facility: Model<IFacility> =
  mongoose.models.Facility || mongoose.model<IFacility>('Facility', FacilitySchema);
