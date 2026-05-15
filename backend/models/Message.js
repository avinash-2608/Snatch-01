const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  splitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Split',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Index for faster queries by splitId
messageSchema.index({ splitId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
