import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  slug: string;
  photo?: string;
  designation: string;
  subject?: string;
  class?: string;
  biography?: string;
  experience?: string;
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    photo: { type: String, default: '' },
    designation: { type: String, required: true },
    subject: { type: String, default: '' },
    class: { type: String, default: '' },
    biography: { type: String, default: '' },
    experience: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
