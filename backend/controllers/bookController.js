import Book from '../models/Book.js'
import BookByUsers from '../models/BookByUsers.js'
import User from '../models/User.js'
import { pruneClickLogs, pruneEmbeds } from '../utils/shelfManager.js'
import { computeWeightedRating, analyzeSentiment } from '../utils/weightedRating.js'

const MAX_OPTIONAL = 20

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'active' })
      .select('title author coverImage genre accessType price weightedRating totalRatings totalComments shelf releaseYear registeredAt')
      .sort({ registeredAt: -1 })
    res.json(books)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('embeddedComments.userId', 'fullName')
    if (!book || book.status === 'empty') return res.status(404).json({ message: 'Buku tidak ditemukan' })
    res.json(book)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addBook = async (req, res) => {
  try {
    const required = ['title','author','releaseYear','isbn','accessType','pageCount','publisher','genre','coverImage']
    for (const f of required) {
      if (!req.body[f]) return res.status(400).json({ message: `Field '${f}' wajib diisi` })
    }
    if (!Array.isArray(req.body.genre) || req.body.genre.length === 0)
      return res.status(400).json({ message: 'Minimal 1 genre wajib dipilih' })
    if (req.body.accessType === 'sale' && req.body.price === undefined)
      return res.status(400).json({ message: 'Harga wajib diisi untuk buku berbayar' })

    const emptySlot = await Book.findOne({ status: 'empty' })
    if (emptySlot) {
      const updated = await Book.findByIdAndUpdate(
        emptySlot._id,
        { ...req.body, status: 'active', shelf: 'cold', registeredAt: new Date(),
          clickLogs: [], embeddedComments: [], embeddedRatings: [], optionalAttributes: [],
          totalViews: 0, uniqueViewers: 0, totalComments: 0, totalRatings: 0,
          averageRating: 0, weightedRating: 0, previousBook: emptySlot.previousBook },
        { new: true }
      )
      return res.status(201).json(updated)
    }

    const book = await Book.create(req.body)
    res.status(201).json(book)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const archiveBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true })
    if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' })
    res.json({ message: 'Buku diarsipkan', book })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' })

    await Book.findByIdAndUpdate(req.params.id, {
      $unset: { title: '', author: '', releaseYear: '', isbn: '', accessType: '', price: '',
                 pageCount: '', publisher: '', genre: '', coverImage: '' },
      status: 'empty',
      previousBook: book._id,
      clickLogs: [], embeddedComments: [], embeddedRatings: [], optionalAttributes: [],
      totalViews: 0, uniqueViewers: 0, totalComments: 0, totalRatings: 0,
      averageRating: 0, weightedRating: 0
    })
    res.json({ message: 'Slot buku didaur ulang (empty slot siap diisi)' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const clickBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book || book.status !== 'active') return res.status(404).json({ message: 'Buku tidak ditemukan' })

    const userId = req.user?._id?.toString() || 'anonymous'
    const ip     = req.ip || 'unknown'

    const alreadyViewed = book.clickLogs.some(l => l.userId === userId && l.userId !== 'anonymous')
    book.clickLogs.push({ userId, ip, ts: new Date() })
    book.clickLogs = pruneClickLogs(book.clickLogs, book.shelf)
    book.totalViews += 1
    if (!alreadyViewed) book.uniqueViewers += 1

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { viewedBooks: { bookId: book._id, count: 1, lastViewed: new Date() } }
      })
    }

    await updateRecommendation(req.user, book, 'view')
    await book.save()
    res.json({ totalViews: book.totalViews, uniqueViewers: book.uniqueViewers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ message: 'Komentar tidak boleh kosong' })

    const book = await Book.findById(req.params.id)
    if (!book || book.status !== 'active') return res.status(404).json({ message: 'Buku tidak ditemukan' })

    const sentiment = analyzeSentiment(text)
    const comment = { userId: req.user._id, userName: req.user.fullName, text, sentiment, likes: [], createdAt: new Date() }

    book.embeddedComments.unshift(comment)
    pruneEmbeds(book)
    book.totalComments += 1

    await User.findByIdAndUpdate(req.user._id, {
      $push: { myComments: { bookId: book._id, text, sentiment, createdAt: new Date() } }
    })

    await updateGenrePreference(req.user._id, book.genre, sentiment)
    await updateRecommendation(req.user, book, 'comment')
    await book.save()
    res.status(201).json({ message: 'Komentar ditambahkan', comment })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' })

    const comment = book.embeddedComments.id(commentId)
    if (!comment) return res.status(404).json({ message: 'Komentar tidak ditemukan' })

    const uid = req.user._id
    const alreadyLiked = comment.likes.some(l => l.equals(uid))
    if (alreadyLiked) return res.status(409).json({ message: 'Sudah pernah like komentar ini' })

    comment.likes.push(uid)
    await book.save()
    res.json({ likes: comment.likes.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const rateBook = async (req, res) => {
  try {
    const { score } = req.body
    if (!score || score < 1 || score > 5) return res.status(400).json({ message: 'Score harus antara 1-5' })

    const book = await Book.findById(req.params.id)
    if (!book || book.status !== 'active') return res.status(404).json({ message: 'Buku tidak ditemukan' })

    const existing = book.embeddedRatings.find(r => r.userId.equals(req.user._id))
    if (existing) {
      existing.score     = score
      existing.createdAt = new Date()
    } else {
      book.embeddedRatings.unshift({ userId: req.user._id, score, createdAt: new Date() })
      book.totalRatings += 1
    }

    pruneEmbeds(book)
    const allScores    = book.embeddedRatings.map(r => r.score)
    book.averageRating = allScores.reduce((a, b) => a + b, 0) / allScores.length
    book.weightedRating = await computeWeightedRating(book)

    const userDoc = await User.findById(req.user._id)
    if (userDoc) {
      const idx = userDoc.myRatings?.findIndex(r => r.bookId.equals(book._id)) ?? -1
      if (idx >= 0) {
        await User.findByIdAndUpdate(req.user._id, { $set: { [`myRatings.${idx}.score`]: score } })
      } else {
        await User.findByIdAndUpdate(req.user._id, { $push: { myRatings: { bookId: book._id, score, createdAt: new Date() } } })
      }
    }

    const sentiment = score >= 4 ? 'liked' : (score < 3 ? 'avoided' : null)
    if (sentiment) await updateGenrePreference(req.user._id, book.genre, sentiment === 'liked' ? 'positive' : 'negative')
    await updateRecommendation(req.user, book, 'rating')
    await book.save()
    res.json({ averageRating: book.averageRating, weightedRating: book.weightedRating, totalRatings: book.totalRatings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const checkout = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book || book.status !== 'active') return res.status(404).json({ message: 'Buku tidak ditemukan' })

    let lib = await BookByUsers.findOne({ userId: req.user._id })
    if (!lib) lib = new BookByUsers({ userId: req.user._id, books: [] })

    const owned = lib.books.some(b => b.bookId.equals(book._id))
    if (owned) return res.status(409).json({ message: 'Buku sudah dimiliki' })

    lib.books.push({ bookId: book._id, acquiredAt: new Date() })
    await lib.save()
    res.status(201).json({ message: 'Buku berhasil di-checkout', bookId: book._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addOptionalAttribute = async (req, res) => {
  try {
    const { key, label, type, value } = req.body
    if (!key || !label || !type) return res.status(400).json({ message: 'key, label, type wajib diisi' })

    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Buku tidak ditemukan' })

    const totalAttrs = 9 + book.optionalAttributes.length
    if (totalAttrs >= MAX_OPTIONAL) return res.status(400).json({ message: 'Maksimal 20 atribut per buku' })

    const duplicate = book.optionalAttributes.find(a => a.key === key)
    if (duplicate) return res.status(409).json({ message: 'Atribut dengan key ini sudah ada' })

    book.optionalAttributes.push({ key, label, type, value })
    await book.save()
    res.status(201).json({ message: 'Atribut ditambahkan', optionalAttributes: book.optionalAttributes })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateGenrePreference = async (userId, genres, sentiment) => {
  if (!genres?.length) return
  const field = sentiment === 'positive' ? 'genrePreferences.liked' : 'genrePreferences.avoided'
  const user  = await User.findById(userId)
  if (!user) return
  for (const genre of genres) {
    const prefs  = sentiment === 'positive' ? user.genrePreferences?.liked : user.genrePreferences?.avoided
    const exists = prefs?.find(p => p.genre === genre)
    if (exists) {
      await User.updateOne(
        { _id: userId, [`${field}.genre`]: genre },
        { $inc: { [`${field}.$.score`]: 1 } }
      )
    } else {
      await User.findByIdAndUpdate(userId, { $push: { [field]: { genre, score: 1 } } })
    }
  }
}

const updateRecommendation = async (user, book, source) => {
  if (!user) return
  const userDoc = await User.findById(user._id)
  if (!userDoc || userDoc.myRecommendation?.bookId) return
  await User.findByIdAndUpdate(user._id, {
    $set: { myRecommendation: { bookId: book._id, reason: `${source} on "${book.title}"`, source, lockedAt: new Date() } }
  })
}
