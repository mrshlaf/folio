import express from 'express'
import { homepage, search, materializedView, hotBooks, mostCommented, mostViewed } from '../controllers/searchController.js'

const router = express.Router()

router.get('/homepage',             homepage)
router.get('/search',               search)
router.get('/hot',                  hotBooks)
router.get('/most-commented',       mostCommented)
router.get('/most-viewed',          mostViewed)
router.get('/view/:viewType',       materializedView)

export default router
