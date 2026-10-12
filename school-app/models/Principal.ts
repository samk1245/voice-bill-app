import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrincipal extends Document {
  name: string;
  photo?: string;
  designation: string;
  biography?: string;
  education?: string;
  experience?: string;
  messageStudents?: string;
  messageParents?: string;
  updatedAt: Date;
}

const PrincipalSchema = new Schema<IPrincipal>(
  {
    name: { type: String, required: true, default: 'Principal — To be updated by Admin' },
    photo: { type: String, default: '' },
    designation: { type: String, default: 'Headmaster / Principal' },
    biography: { type: String, default: '' },
    education: { type: String, default: '' },
    experience: { type: String, default: '' },
    messageStudents: { type: String, default: '' },
    messageParents: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Principal: Model<IPrincipal> =
  mongoose.models.Principal || mongoose.model<IPrincipal>('Principal', PrincipalSchema);
