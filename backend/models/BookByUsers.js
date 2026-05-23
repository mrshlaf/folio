import mongoose from 'mongoose'

const ownedBookSchema = new mongoose.Schema({
  bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  acquiredAt: { type: Date, default: Date.now },
  lastReadAt: { type: Date }
}, { _id: false })

const bookByUsersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  books: { type: [ownedBookSchema], default: [] }
}, { timestamps: true })

export default mongoose.model('BookByUsers', bookByUsersSchema)
