import User from '../models/User.js'
import BookByUsers from '../models/BookByUsers.js'

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getLibrary = async (req, res) => {
  try {
    const lib = await BookByUsers.findOne({ userId: req.user._id })
      .populate('books.bookId', 'title author coverImage genre accessType price')
    res.json(lib?.books || [])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
