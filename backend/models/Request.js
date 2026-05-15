const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  location: { type: String, required: true },
  offerName: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  description: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
