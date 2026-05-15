const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send a new message
router.post('/', messageController.sendMessage);

// Get all messages for a split
router.get('/:splitId', messageController.getMessagesBySplit);

module.exports = router;
