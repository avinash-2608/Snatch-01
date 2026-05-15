const Split = require('../models/Split');
const Offer = require('../models/Offer');

// Get split status for an offer (current active split)
exports.getSplitStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    // Find pending split for this offer
    const pendingSplit = await Split.findOne({ 
      offerId, 
      status: 'pending' 
    });
    
    if (pendingSplit) {
      return res.status(200).json({
        splitId: pendingSplit._id,
        count: pendingSplit.users.length,
        max: 2,
        status: 'pending',
        users: pendingSplit.users
      });
    }
    
    // No active split found
    res.status(200).json({
      count: 0,
      max: 2,
      status: 'none'
    });
  } catch (error) {
    console.error('Get Split Status Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Join or create a split
exports.joinSplit = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ message: 'User ID and name are required' });
    }
    
    // Check if offer is eligible for split
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    const eligibleTypes = ['Percentage Discount Offer', 'Flat Discount Offer'];
    if (!eligibleTypes.includes(offer.offerType)) {
      return res.status(400).json({ message: 'This offer type does not support splitting' });
    }
    
    // Check if user already in a pending split for this offer
    const existingUserSplit = await Split.findOne({
      offerId,
      status: 'pending',
      'users.userId': userId
    });
    
    if (existingUserSplit) {
      return res.status(400).json({ message: 'You are already in a split for this offer' });
    }
    
    // Find pending split with space available
    let split = await Split.findOne({ 
      offerId, 
      status: 'pending',
      'users.1': { $exists: false } // Less than 2 users
    });
    
    if (split) {
      // Join existing split
      split.users.push({ userId, userName });
      
      // If now has 2 users, mark as matched
      if (split.users.length === 2) {
        split.status = 'matched';
      }
      
      await split.save();
      
      res.status(200).json({
        message: split.status === 'matched' ? 'Split matched! You can now chat.' : 'Joined split',
        split: {
          id: split._id,
          status: split.status,
          count: split.users.length,
          max: 2,
          users: split.users,
          canChat: split.status === 'matched'
        }
      });
    } else {
      // Create new split
      const newSplit = new Split({
        offerId,
        users: [{ userId, userName }],
        status: 'pending'
      });
      
      await newSplit.save();
      
      res.status(201).json({
        message: 'New split created. Waiting for someone to join...',
        split: {
          id: newSplit._id,
          status: 'pending',
          count: 1,
          max: 2,
          users: newSplit.users,
          canChat: false
        }
      });
    }
  } catch (error) {
    console.error('Join Split Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user's splits
exports.getUserSplits = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const splits = await Split.find({
      'users.userId': userId
    }).populate('offerId', 'title name offerType');
    
    // Categorize splits
    const categorized = {
      active: [],
      pending: [],
      matched: [],
      history: []
    };
    
    splits.forEach(split => {
      const isUserInSplit = split.users.some(u => u.userId.toString() === userId);
      if (!isUserInSplit) return;
      
      const splitData = {
        id: split._id,
        offer: split.offerId,
        users: split.users,
        status: split.status,
        count: split.users.length,
        max: 2,
        canChat: split.status === 'matched' && split.users.length === 2,
        createdAt: split.createdAt,
        updatedAt: split.updatedAt
      };
      
      if (split.status === 'pending') {
        categorized.pending.push(splitData);
        categorized.active.push(splitData);
      } else if (split.status === 'matched') {
        categorized.matched.push(splitData);
        categorized.active.push(splitData);
      } else {
        categorized.history.push(splitData);
      }
    });
    
    res.status(200).json(categorized);
  } catch (error) {
    console.error('Get User Splits Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get split details with messages
exports.getSplitDetails = async (req, res) => {
  try {
    const { splitId } = req.params;
    
    const split = await Split.findById(splitId).populate('offerId', 'title name offerType');
    
    if (!split) {
      return res.status(404).json({ message: 'Split not found' });
    }
    
    res.status(200).json({
      id: split._id,
      offer: split.offerId,
      users: split.users,
      status: split.status,
      count: split.users.length,
      max: 2,
      canChat: split.status === 'matched' && split.users.length === 2,
      messages: split.messages || []
    });
  } catch (error) {
    console.error('Get Split Details Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Send message in split
exports.sendMessage = async (req, res) => {
  try {
    const { splitId } = req.params;
    const { userId, userName, text } = req.body;
    
    if (!userId || !userName || !text) {
      return res.status(400).json({ message: 'User ID, name, and message text are required' });
    }
    
    const split = await Split.findById(splitId);
    
    if (!split) {
      return res.status(404).json({ message: 'Split not found' });
    }
    
    // Verify user is in the split
    const isUserInSplit = split.users.some(u => u.userId.toString() === userId);
    if (!isUserInSplit) {
      return res.status(403).json({ message: 'You are not a member of this split' });
    }
    
    // Only allow messages when matched
    if (split.status !== 'matched') {
      return res.status(400).json({ message: 'Chat is only available when split is matched' });
    }
    
    const message = {
      userId,
      userName,
      text,
      timestamp: new Date()
    };
    
    split.messages.push(message);
    await split.save();
    
    res.status(201).json({
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Leave split (for pending splits)
exports.leaveSplit = async (req, res) => {
  try {
    const { splitId } = req.params;
    const { userId } = req.body;
    
    const split = await Split.findById(splitId);
    
    if (!split) {
      return res.status(404).json({ message: 'Split not found' });
    }
    
    if (split.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot leave a matched or completed split' });
    }
    
    // Remove user from split
    split.users = split.users.filter(u => u.userId.toString() !== userId);
    
    if (split.users.length === 0) {
      // Delete empty split
      await Split.findByIdAndDelete(splitId);
      return res.status(200).json({ message: 'Split cancelled' });
    }
    
    await split.save();
    res.status(200).json({ message: 'Left split successfully' });
  } catch (error) {
    console.error('Leave Split Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
