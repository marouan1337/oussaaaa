import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager'],
    default: 'manager',
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  whatsappNumber: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});


export const User = mongoose.models.User || mongoose.model('User', userSchema);