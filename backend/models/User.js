import mongoose from 'mongoose'

const genreScoreSchema = new mongoose.Schema({
  genre: String,
  score: { type: Number, default: 0 }
}, { _id: false })

const userSchema = new mongoose.Schema({
  fullName:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  age:       { type: Number, required: true },
  job:       { type: String, required: true },
  country:   { type: String, required: true },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },

  genrePreferences: {
    liked:   { type: [genreScoreSchema], default: undefined },
    avoided: { type: [genreScoreSchema], default: undefined }
  },

  myRecommendation: {
    bookId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    reason:    String,
    source:    { type: String, enum: ['view', 'comment', 'rating'] },
    lockedAt:  Date
  },

  myRatings: {
    type: [{
      bookId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      score:     { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }],
    default: undefined
  },

  myComments: {
    type: [{
      bookId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      text:      String,
      sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
      createdAt: { type: Date, default: Date.now }
    }],
    default: undefined
  },

  viewedBooks: {
    type: [{
      bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      count:      { type: Number, default: 1 },
      lastViewed: { type: Date, default: Date.now }
    }],
    default: undefined
  }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
