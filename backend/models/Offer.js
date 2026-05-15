const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: String,
    enum: ['store', 'user'],
    required: true
  },
  isUserGenerated: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  offerType: {
    type: String,
    enum: ['BOGO Offer', 'Percentage Discount Offer', 'Flat Discount Offer', 'Combo Offer', 'First Order Offer', 'Freebie Offer'],
    default: 'Flat Discount Offer',
    required: true
  },
  isGoldExclusive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
