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

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected')
    await seedAdmin()
    cron.schedule('0 */30 * * * *', async () => {
      await evaluateShelf()
      console.log('Shelf evaluated:', new Date().toISOString())
    })
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })