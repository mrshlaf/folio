import { getMaterializedViews, getHomepageBooks } from '../utils/materializeViews.js'
import Book from '../models/Book.js'

export const homepage = async (req, res) => {
  try {
    const books = await getHomepageBooks()
    res.json(books)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const search = async (req, res) => {
  try {
    const { q, genre, year, page = 1, limit = 20 } = req.query
    const filter = { status: 'active' }
    if (q) filter.$text = { $search: q }
    if (genre) filter.genre = genre
    if (year) filter.releaseYear = Number(year)

    const skip = (Number(page) - 1) * Number(limit)
    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort(q ? { score: { $meta: 'textScore' } } : { weightedRating: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('title author coverImage genre accessType price weightedRating totalRatings totalComments releaseYear publisher'),
      Book.countDocuments(filter)
    ])

    res.json({ books, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const materializedView = async (req, res) => {
  try {
    const all = await getMaterializedViews()
    const { viewType } = req.params
    if (viewType === 'all') return res.json(all)
    if (!all[viewType]) return res.status(404).json({ message: 'View tidak ditemukan' })
    res.json(all[viewType])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const hotBooks = async (req, res) => {
  try {
    const views = await getMaterializedViews()
    res.json(views.hotBooks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const mostCommented = async (req, res) => {
  try {
    const views = await getMaterializedViews()
    res.json(views.mostCommented)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const mostViewed = async (req, res) => {
  try {
    const views = await getMaterializedViews()
    res.json(views.mostViewed)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
