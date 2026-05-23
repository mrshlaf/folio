import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/

export const register = async (req, res) => {
  try {
    const { fullName, phone, email, password, age, job, country } = req.body
    if (!fullName || !phone || !email || !password || !age || !job || !country)
      return res.status(400).json({ message: 'Semua field wajib diisi' })

    if (!PASSWORD_REGEX.test(password))
      return res.status(400).json({
        message: 'Password tidak memenuhi syarat',
        requirements: [
          'Minimal 10 karakter',
          'Mengandung huruf besar (A-Z)',
          'Mengandung huruf kecil (a-z)',
          'Mengandung angka (0-9)',
          'Mengandung karakter spesial (!@#$%^&*...)'
        ]
      })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(409).json({ message: 'Email sudah terdaftar' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ fullName, phone, email, password: hashed, age: Number(age), job, country })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email dan password wajib diisi' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ message: 'Email atau password salah' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Email atau password salah' })

    const token = signToken(user._id)
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMe = async (req, res) => {
  res.json({
    id:       req.user._id,
    fullName: req.user.fullName,
    email:    req.user.email,
    phone:    req.user.phone,
    age:      req.user.age,
    job:      req.user.job,
    country:  req.user.country,
    role:     req.user.role
  })
}
