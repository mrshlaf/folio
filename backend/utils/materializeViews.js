import Book from '../models/Book.js'

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000

const activeBooks = { status: 'active' }

export const getMaterializedViews = async () => {
  const [
    yearGenre,
    genreAlpha,
    genreRegistered,
    registeredAlpha,
    genreRating,
    alphaRating,
    yearRating,
    hotBooks,
    mostCommented,
    mostViewed
  ] = await Promise.all([

    Book.aggregate([
      { $match: activeBooks },
      { $unwind: '$genre' },
      { $group: { _id: { year: '$releaseYear', genre: '$genre' }, count: { $sum: 1 }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage', weightedRating: '$weightedRating' } } } },
      { $sort: { '_id.year': -1, '_id.genre': 1 } }
    ]),

    Book.aggregate([
      { $match: activeBooks },
      { $unwind: '$genre' },
      { $group: { _id: { genre: '$genre', letter: { $toUpper: { $substrCP: ['$title', 0, 1] } } }, count: { $sum: 1 }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage' } } } },
      { $sort: { '_id.genre': 1, '_id.letter': 1 } }
    ]),

    Book.aggregate([
      { $match: activeBooks },
      { $unwind: '$genre' },
      { $group: { _id: { genre: '$genre' }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage', registeredAt: '$registeredAt' } } } },
      { $sort: { '_id.genre': 1 } }
    ]),

    Book.aggregate([
      { $match: activeBooks },
      { $group: { _id: { letter: { $toUpper: { $substrCP: ['$title', 0, 1] } } }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage', registeredAt: '$registeredAt' } } } },
      { $sort: { '_id.letter': 1 } }
    ]),

    Book.aggregate([
      { $match: activeBooks },
      { $unwind: '$genre' },
      { $group: { _id: '$genre', avgWeighted: { $avg: '$weightedRating' }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage', weightedRating: '$weightedRating' } } } },
      { $sort: { avgWeighted: -1 } }
    ]),

    Book.aggregate([
      { $match: activeBooks },
      { $group: { _id: { letter: { $toUpper: { $substrCP: ['$title', 0, 1] } } }, avgWeighted: { $avg: '$weightedRating' }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage', weightedRating: '$weightedRating' } } } },
      { $sort: { '_id.letter': 1 } }
    ]),

    Book.aggregate([
      { $match: activeBooks },
      { $group: { _id: '$releaseYear', avgWeighted: { $avg: '$weightedRating' }, books: { $push: { id: '$_id', title: '$title', coverImage: '$coverImage', weightedRating: '$weightedRating' } } } },
      { $sort: { avgWeighted: -1 } }
    ]),

    Book.find({ status: 'active' })
      .sort({ weightedRating: -1 })
      .limit(10)
      .select('title author coverImage genre weightedRating averageRating totalRatings registeredAt accessType price'),

    Book.find({ status: 'active' })
      .sort({ totalComments: -1 })
      .limit(10)
      .select('title author coverImage genre totalComments registeredAt accessType price'),

    Book.find({ status: 'active' })
      .sort({ uniqueViewers: -1, totalViews: -1 })
      .limit(10)
      .select('title author coverImage genre uniqueViewers totalViews accessType price')
  ])

  return {
    yearGenre,
    genreAlpha,
    genreRegistered,
    registeredAlpha,
    genreRating,
    alphaRating,
    yearRating,
    hotBooks,
    mostCommented,
    mostViewed,
    generatedAt: new Date()
  }
}

export const getHomepageBooks = async () => {
  const since14 = new Date(Date.now() - FOURTEEN_DAYS)
  let recent = await Book.find({ status: 'active', registeredAt: { $gte: since14 } })
    .select('title author coverImage genre accessType price weightedRating registeredAt')

  if (recent.length === 0) {
    recent = await Book.find({ status: 'active' })
      .limit(20)
      .select('title author coverImage genre accessType price weightedRating registeredAt')
  }

  const shuffled = recent.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10)
}
