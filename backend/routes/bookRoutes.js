import express from 'express'
import {
  getBooks, getBook, addBook, archiveBook, deleteBook,
  clickBook, addComment, likeComment, rateBook, checkout, addOptionalAttribute
} from '../controllers/bookController.js'
import { protect } from '../middleware/auth.js'
import { adminOnly } from '../middleware/adminOnly.js'

const router = express.Router()

router.get('/',                             getBooks)
router.get('/:id',                          getBook)
router.post('/add',          protect, adminOnly, addBook)
router.patch('/:id/archive', protect, adminOnly, archiveBook)
router.delete('/:id',        protect, adminOnly, deleteBook)
router.post('/:id/click',    protect,             clickBook)
router.post('/:id/comment',  protect,             addComment)
router.post('/:id/comment/:commentId/like', protect, likeComment)
router.post('/:id/rate',     protect,             rateBook)
router.post('/:id/checkout', protect,             checkout)
router.post('/:id/attribute',protect, adminOnly, addOptionalAttribute)

export default router
