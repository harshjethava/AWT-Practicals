import express from 'express'
import { Product } from '../models/Product.js'

export const productsRouter = express.Router()

productsRouter.get('/', async (_req, res) => {
  const items = await Product.find({}).sort({ createdAt: -1 }).limit(100)
  return res.json({ items })
})

productsRouter.post('/seed', async (_req, res) => {
  const count = await Product.countDocuments()
  if (count > 0) {
    return res.json({ message: 'Already seeded', count })
  }

  const items = await Product.insertMany([
    {
      title: 'Wireless Headphones',
      description: 'Comfort fit, long battery life',
      price: 1499,
      imageUrl: 'https://images.unsplash.com/photo-1518441985597-78c4f1c04882?auto=format&fit=crop&w=900&q=60',
      category: 'Electronics',
      stock: 50,
    },
    {
      title: 'Smart Watch',
      description: 'Track your fitness all day',
      price: 2599,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60',
      category: 'Electronics',
      stock: 40,
    },
    {
      title: 'Backpack',
      description: 'Water resistant, multi-compartment',
      price: 999,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=60',
      category: 'Accessories',
      stock: 80,
    },
    {
      title: 'Running Shoes',
      description: 'Lightweight and durable',
      price: 2199,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=60',
      category: 'Fashion',
      stock: 60,
    },
  ])

  return res.status(201).json({ message: 'Seeded', items })
})
