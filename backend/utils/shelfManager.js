import Book from '../models/Book.js'

const COLD_RECENT = 100
const COLD_OLD = 50
const HOT_RECENT = 200
const HOT_OLD = 50
const HOT_COMMENTS = 10
const HOT_RATINGS = 10
const COLD_COMMENTS = 5
const COLD_RATINGS = 5

export const pruneClickLogs = (logs, shelf) => {
  const recent = shelf === 'hot' ? HOT_RECENT : COLD_RECENT
  const old = shelf === 'hot' ? HOT_OLD : COLD_OLD
  const sorted = [...logs].sort((a, b) => new Date(b.ts) - new Date(a.ts))
  const head = sorted.slice(0, recent)
  const tail = sorted.slice(-old).filter(l => !head.includes(l))
  return [...head, ...tail]
}

export const pruneEmbeds = (book) => {
  const maxC = book.shelf === 'hot' ? HOT_COMMENTS : COLD_COMMENTS
  const maxR = book.shelf === 'hot' ? HOT_RATINGS : COLD_RATINGS
  book.embeddedComments = [...book.embeddedComments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, maxC)
  book.embeddedRatings = [...book.embeddedRatings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, maxR)
}

export const evaluateShelf = async () => {
  const top10 = await Book.find({ status: 'active' })
    .sort({ weightedRating: -1, totalComments: -1, uniqueViewers: -1 })
    .limit(10)
    .select('_id')

  const hotIds = new Set(top10.map(b => b._id.toString()))

  const allBooks = await Book.find({ status: 'active' }).select('_id shelf')
  const ops = allBooks.map(book => {
    const shouldBeHot = hotIds.has(book._id.toString())
    if (shouldBeHot && book.shelf !== 'hot') return Book.findByIdAndUpdate(book._id, { shelf: 'hot' })
    if (!shouldBeHot && book.shelf !== 'cold') return Book.findByIdAndUpdate(book._id, { shelf: 'cold' })
    return Promise.resolve()
  })
  await Promise.all(ops)
}
