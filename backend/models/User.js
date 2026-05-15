const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['customer', 'store', 'admin'],
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  storeName: {
    type: String
  },
  location: {
    type: String
  },
  phone: {
    type: String
  },
  approved: {
    type: Boolean,
    default: false
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  premiumExpiry: { 
    type: Date, 
    default: null 
  },
  snatchTokens: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
