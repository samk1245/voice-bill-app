import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    primaryColor: { type: String, default: '#10b981' }, // Default Emerald
    secondaryColor: { type: String, default: '#065f46' }
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model('Store', StoreSchema);
