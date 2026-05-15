const express = require('express');
const router = express.Router();
const splitController = require('../controllers/splitController');

// Get split status for an offer
router.get('/status/:offerId', splitController.getSplitStatus);

// Join or create a split for an offer
router.post('/join/:offerId', splitController.joinSplit);

// Get user's splits
router.get('/user/:userId', splitController.getUserSplits);

// Get split details with messages
router.get('/:splitId', splitController.getSplitDetails);

// Send message in split
router.post('/message/:splitId', splitController.sendMessage);

// Leave split
router.post('/leave/:splitId', splitController.leaveSplit);

module.exports = router;
