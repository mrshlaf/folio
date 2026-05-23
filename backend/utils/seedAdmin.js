import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export const seedAdmin = async () => {
  const exists = await User.findOne({ email: 'admin@gmail.com' })
  if (exists) return
  const hashed = await bcrypt.hash('admin', 10)
  await User.create({
    fullName: 'Administrator',
    phone:    '000000000',
    email:    'admin@gmail.com',
    password: hashed,
    age:      30,
    job:      'Other',
    country:  'Indonesia',
    role:     'admin'
  })
  console.log('Admin seeded: admin@gmail.com / admin')
}
