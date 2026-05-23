import mongoose from 'mongoose'

const clickLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'anonymous' },
  ip:     String,
  ts:     { type: Date, default: Date.now }
}, { _id: false })

const commentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:  { type: String, required: true },
  text:      { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  likes:     { type: [mongoose.Schema.Types.ObjectId], default: [] },
  createdAt: { type: Date, default: Date.now }
})

const ratingSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:     { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

const optionalAttrSchema = new mongoose.Schema({
  key:   { type: String, required: true },
  label: { type: String, required: true },
  type:  { type: String, enum: ['ebook', 'audio', 'voucher', 'giftcard', 'other'], required: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { _id: false })

const bookSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  author:     { type: String, required: true, trim: true },
  releaseYear:{ type: Number, required: true },
  isbn:       { type: String, sparse: true, unique: true },
  accessType: { type: String, enum: ['free', 'sale'], required: true },
  price: {
    type: Number,
    required: function () { return this.accessType === 'sale' },
    default: 0
  },
  pageCount:  { type: Number, required: true },
  publisher:  { type: String, required: true },
  genre:      { type: [String], required: true },
  coverImage: { type: String, required: true },

  status: { type: String, enum: ['active', 'archived', 'empty'], default: 'active' },
  shelf:  { type: String, enum: ['cold', 'hot'], default: 'cold' },

  totalViews:     { type: Number, default: 0 },
  uniqueViewers:  { type: Number, default: 0 },
  totalComments:  { type: Number, default: 0 },
  totalRatings:   { type: Number, default: 0 },
  averageRating:  { type: Number, default: 0 },
  weightedRating: { type: Number, default: 0 },

  clickLogs:        { type: [clickLogSchema], default: [] },
  embeddedComments: { type: [commentSchema], default: [] },
  embeddedRatings:  { type: [ratingSchema], default: [] },

  optionalAttributes: { type: [optionalAttrSchema], default: [] },
  driveLink: { type: String, default: 'https://drive.google.com/file/d/1Gs2lkAelCje1xCGzRpcgSO12ZGHhe-17/view?usp=sharing' },

  registeredAt: { type: Date, default: Date.now },
  previousBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true })

bookSchema.index({ title: 'text', author: 'text' })
bookSchema.index({ genre: 1 })
bookSchema.index({ registeredAt: -1 })
bookSchema.index({ weightedRating: -1 })
bookSchema.index({ status: 1, shelf: 1 })

export default mongoose.model('Book', bookSchema)
