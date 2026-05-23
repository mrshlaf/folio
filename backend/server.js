import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cron from 'node-cron'

import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import userRoutes from './routes/userRoutes.js'
import searchRoutes from './routes/searchRoutes.js'

import { seedAdmin } from './utils/seedAdmin.js'
import { evaluateShelf } from './utils/shelfManager.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

app.set('trust proxy', 1)

app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true }))

let isDbConnected = false

const connectDB = async () => {
  if (isDbConnected) return
  try {
    await mongoose.connect(MONGO_URI)
    isDbConnected = true
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    throw err
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)

// Vercel Cron Endpoint
app.get('/api/cron/evaluate-shelf', async (req, res) => {
  try {
    // Note: Vercel Cron sends a secret header, but we'll leave it open for simplicity
    // or validate if process.env.CRON_SECRET is provided.
    if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    await evaluateShelf()
    console.log('Vercel Cron: Shelf evaluated')
    res.json({ message: 'Shelf evaluated successfully' })
  } catch (err) {
    console.error('Vercel Cron Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(async () => {
    await seedAdmin()
    cron.schedule('0 */30 * * * *', async () => {
      await evaluateShelf()
      console.log('Shelf evaluated:', new Date().toISOString())
    })
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  }).catch(err => {
    console.error('Local init failed:', err.message)
    process.exit(1)
  })
}

export default app