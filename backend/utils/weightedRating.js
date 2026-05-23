import Book from '../models/Book.js'

export const computeWeightedRating = async (book) => {
  const R = book.averageRating || 0
  const v = book.totalRatings  || 0
  const m = 10

  const globalRes = await Book.aggregate([
    { $match: { status: 'active', totalRatings: { $gt: 0 } } },
    { $group: { _id: null, C: { $avg: '$averageRating' } } }
  ])
  const C = globalRes[0]?.C || 3

  const bayesian = (v / (v + m)) * R + (m / (v + m)) * C

  const now = Date.now()
  const ageDays = (now - new Date(book.registeredAt).getTime()) / 86400000
  const timeFactor = 1 / (1 + ageDays / 30)

  return parseFloat((bayesian * (0.8 + 0.2 * timeFactor)).toFixed(4))
}

export const analyzeSentiment = (text) => {
  const lower = text.toLowerCase()
  const positiveWords = ['bagus','keren','mantap','luar biasa','suka','rekomend','good','great','excellent','amazing','wonderful','best','top','sip','oke']
  const negativeWords = ['buruk','jelek','payah','sampah','tidak suka','bad','terrible','awful','horrible','disappointing','gagal','bosan','membosankan']
  let score = 0
  positiveWords.forEach(w => { if (lower.includes(w)) score++ })
  negativeWords.forEach(w => { if (lower.includes(w)) score-- })
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

export const effectiveCommentCount = (comments) => {
  const pos = comments.filter(c => c.sentiment === 'positive').length
  const neg = comments.filter(c => c.sentiment === 'negative').length
  return Math.max(0, comments.length + pos - neg)
}
