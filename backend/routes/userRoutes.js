import express from 'express'
import { getProfile, getLibrary } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/profile', protect, getProfile)
router.get('/library', protect, getLibrary)

export default router
