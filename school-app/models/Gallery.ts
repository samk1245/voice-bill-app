import mongoose, { Schema, Document, Model } from 'mongoose';

export type GalleryCategory =
  | 'School'
  | 'Classrooms'
  | 'Activities'
  | 'Events'
  | 'Teachers'
  | 'Students'
  | 'Garden'
  | 'Kitchen'
  | 'Playground'
  | 'Celebrations'
  | 'Other';

export interface IGallery extends Document {
  image: string;
  title: string;
  caption?: string;
  category: GalleryCategory;
  date?: string;
  createdAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    image: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: '' },
    category: {
      type: String,
      enum: [
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
      ],
      default: 'School',
    },
    date: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);
