import express from 'express'
import cors from 'cors'
import { connectDb } from './db.js'
import { authRouter } from './routes/auth.js'
import { productsRouter } from './routes/products.js'
import { checkoutRouter } from './routes/checkout.js'

export function createServer() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/checkout', checkoutRouter)

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  })

  async function start() {
    await connectDb()
  }

  return { app, start }
}
