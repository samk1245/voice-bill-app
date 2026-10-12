import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Color: Blue", "Size: Large"
  price: { type: Number },
  stock: { type: Number, default: 0 }
});

const ProductSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    inventoryCount: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: String },
    variants: [VariantSchema],
    status: { type: String, enum: ['Active', 'Draft'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
