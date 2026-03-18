import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], default: [] },
    paymentMethod: { type: String, enum: ['credit', 'debit', 'cash'], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['otp_pending', 'placed', 'cancelled'],
      default: 'otp_pending',
    },
    placedAt: { type: Date },
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema)
