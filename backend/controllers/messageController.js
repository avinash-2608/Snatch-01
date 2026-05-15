const Message = require('../models/Message');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { splitId, senderId, senderName, message } = req.body;

    if (!splitId || !senderId || !message) {
      return res.status(400).json({ message: 'splitId, senderId, and message are required' });
    }

    const newMessage = new Message({
      splitId,
      senderId,
      senderName: senderName || 'Anonymous',
      message
    });

    await newMessage.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all messages for a split
exports.getMessagesBySplit = async (req, res) => {
  try {
    const { splitId } = req.params;

    if (!splitId) {
      return res.status(400).json({ message: 'splitId is required' });
    }

    const messages = await Message.find({ splitId })
      .sort({ createdAt: 1 }) // Oldest first
      .lean();

    res.status(200).json({
      messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
