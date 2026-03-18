import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, default: 100, min: 0 },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
