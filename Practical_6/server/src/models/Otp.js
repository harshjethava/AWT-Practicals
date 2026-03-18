import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
)

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Otp = mongoose.model('Otp', otpSchema)
