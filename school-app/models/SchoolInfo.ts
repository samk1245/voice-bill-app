import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchoolInfo extends Document {
  schoolName: string;
  tagline: string;
  introduction: string;
  vision: string;
  mission: string;
  values: string[];
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  timings: string;
  logo: string;
  heroImages: string[];
  updatedAt: Date;
}

const SchoolInfoSchema = new Schema<ISchoolInfo>(
  {
    schoolName: { type: String, required: true, default: 'Prathmik Vidyalaya Kareli Bagh' },
    tagline: {
      type: String,
      default: 'Our School • Our Activities • Our Community',
    },
    introduction: { type: String, default: '' },
    vision: { type: String, default: '' },
    mission: { type: String, default: '' },
    values: [{ type: String }],
    address: {
      type: String,
      default: 'Kareli Bagh, Prayagraj, Uttar Pradesh 211016, India',
    },
    phone: { type: String, default: 'School Contact — Update from Admin' },
    email: { type: String, default: 'info@karelibagh.edu.in' },
    mapUrl: {
      type: String,
      default: 'https://maps.google.com/?q=Kareli+Bagh+Prayagraj+Uttar+Pradesh',
    },
    timings: {
      type: String,
      default: 'Monday - Saturday: 8:00 AM - 2:00 PM (Sunday Closed)',
    },
    logo: { type: String, default: '' },
    heroImages: [{ type: String }],
  },
  { timestamps: true }
);

export const SchoolInfo: Model<ISchoolInfo> =
  mongoose.models.SchoolInfo || mongoose.model<ISchoolInfo>('SchoolInfo', SchoolInfoSchema);
