import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
}, { timestamps: true })

// Hash password before saving
// Mongoose 7+ async middleware must NOT call next() — just return the promise
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Instance method to compare passwords
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Never send password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', userSchema)