import express from 'express'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../middleware/auth.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { Otp } from '../models/Otp.js'
import { User } from '../models/User.js'
import { sendOtpEmail } from '../utils/mailer.js'

export const checkoutRouter = express.Router()

function normalizePaymentMethod(method) {
  const m = String(method || '').toLowerCase().trim()
  if (m === 'credit' || m === 'credit card' || m === 'creditcard') return 'credit'
  if (m === 'debit' || m === 'debit card' || m === 'debitcard') return 'debit'
  if (m === 'cash' || m === 'cod') return 'cash'
  return null
}

checkoutRouter.post('/request-otp', requireAuth, async (req, res) => {
  const { cartItems, paymentMethod } = req.body || {}

  const normalizedMethod = normalizePaymentMethod(paymentMethod)
  if (!normalizedMethod) {
    return res.status(400).json({ message: 'Invalid payment method' })
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: 'cartItems required' })
  }

  const productIds = cartItems.map((x) => x.productId)
  const products = await Product.find({ _id: { $in: productIds } })
  const byId = new Map(products.map((p) => [p._id.toString(), p]))

  const items = []
  let subtotal = 0

  for (const ci of cartItems) {
    const pid = String(ci.productId || '')
    const qty = Number(ci.quantity || 0)
    if (!pid || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid cart item' })
    }

    const p = byId.get(pid)
    if (!p) {
      return res.status(400).json({ message: 'Product not found in cart' })
    }

    if (p.stock < qty) {
      return res.status(400).json({ message: `Insufficient stock for ${p.title}` })
    }

    items.push({ productId: p._id, title: p.title, price: p.price, quantity: qty })
    subtotal += p.price * qty
  }

  const order = await Order.create({
    userId: req.user.userId,
    items,
    subtotal,
    paymentMethod: normalizedMethod,
    status: 'otp_pending',
  })

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const otpHash = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000)

  await Otp.create({
    userId: req.user.userId,
    orderId: order._id,
    otpHash,
    expiresAt,
  })

  const user = await User.findById(req.user.userId)
  if (user) {
    await sendOtpEmail({ to: user.email, otp, minutes: 2 })
  }

  return res.status(201).json({
    message: 'OTP sent',
    orderId: order._id,
    expiresAt,
  })
})

checkoutRouter.post('/verify-otp', requireAuth, async (req, res) => {
  const { orderId, otp } = req.body || {}
  if (!orderId || !otp) {
    return res.status(400).json({ message: 'orderId and otp are required' })
  }

  const order = await Order.findOne({ _id: orderId, userId: req.user.userId })
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  if (order.status !== 'otp_pending') {
    return res.status(400).json({ message: 'Order is not awaiting OTP' })
  }

  const otpDoc = await Otp.findOne({ orderId: order._id, userId: req.user.userId }).sort({ createdAt: -1 })
  if (!otpDoc) {
    return res.status(400).json({ message: 'OTP not found' })
  }

  if (otpDoc.usedAt) {
    return res.status(400).json({ message: 'OTP already used' })
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: 'OTP expired' })
  }

  const ok = await bcrypt.compare(String(otp), otpDoc.otpHash)
  if (!ok) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }

  otpDoc.usedAt = new Date()
  await otpDoc.save()

  order.status = 'placed'
  order.placedAt = new Date()
  await order.save()

  return res.json({ message: 'Order placed successfully', orderId: order._id })
})

checkoutRouter.get('/my-orders', requireAuth, async (req, res) => {
  const items = await Order.find({ userId: req.user.userId, status: 'placed' }).sort({ placedAt: -1 }).limit(50)
  return res.json({ items })
})
