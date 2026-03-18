import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { signAccessToken } from '../utils/jwt.js'

export const authRouter = express.Router()

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' })
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash })

  const token = signAccessToken({ userId: user._id.toString(), email: user.email, name: user.name })
  return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'email, password are required' })
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = signAccessToken({ userId: user._id.toString(), email: user.email, name: user.name })
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
})
