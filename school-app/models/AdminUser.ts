import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'School Administrator' },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

export const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
