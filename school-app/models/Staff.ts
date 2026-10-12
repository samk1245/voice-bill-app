import mongoose, { Schema, Document, Model } from 'mongoose';

export type StaffCategory =
  | 'Administrative Staff'
  | 'Support Staff'
  | 'Kitchen Staff'
  | 'Maintenance Staff'
  | 'Other Workers';

export interface IStaff extends Document {
  name: string;
  slug: string;
  photo?: string;
  role: string;
  category: StaffCategory;
  description?: string;
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    photo: { type: String, default: '' },
    role: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Administrative Staff',
        'Support Staff',
        'Kitchen Staff',
        'Maintenance Staff',
        'Other Workers',
      ],
      default: 'Support Staff',
    },
    description: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
