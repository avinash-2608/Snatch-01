const Offer = require('../models/Offer');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');

exports.createOffer = async (req, res) => {
  try {
    const { title, category, description, startDate, endDate, storeId, createdBy, offerType } = req.body;

    if (!title || !category || !description || !startDate || !endDate || !storeId || !createdBy || !offerType) {
      return res.status(400).json({ message: 'All fields including offer type are required.' });
    }

    const newOffer = new Offer({
      title,
      category,
      description,
      startDate,
      endDate,
      storeId,
      createdBy,
      offerType,
      isUserGenerated: createdBy === 'user'
    });

    await newOffer.save();
    res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
  } catch (error) {
    console.error('Create Offer Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    // Get userId from query parameter to check subscription status
    const { userId } = req.query;
    
    // Check if user is a Snatch Gold subscriber
    let isGoldSubscriber = false;
    if (userId) {
      const subscriber = await Subscriber.findOne({ userId });
      isGoldSubscriber = !!subscriber;
    }
    
    console.log(`GetAllOffers: userId=${userId}, isGoldSubscriber=${isGoldSubscriber}`);
    
    // Build query based on subscription status
    let query = {};
    if (!isGoldSubscriber) {
      // Non-subscribers only see non-exclusive offers
      query = { isGoldExclusive: { $ne: true } };
    }
    // Gold subscribers see all offers (no filter)
    
    const offers = await Offer.find(query)
      .populate('storeId', 'storeName approved')
      .sort({ createdAt: -1 });

    const approvedOffers = offers.filter(offer => offer.storeId && offer.storeId.approved === true);
    res.status(200).json(approvedOffers);
  } catch (error) {
    console.error('Get All Offers Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getOffersByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const offers = await Offer.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    console.error('Get Offers By User Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.likeOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { userId } = req.body; // Get userId from request body

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // Check if user already liked this offer (convert to string for comparison)
    const alreadyLiked = offer.likedBy.some(id => id.toString() === userId.toString());
    if (alreadyLiked) {
      return res.status(200).json({
        message: 'Already liked',
        likes: offer.likes,
        likedBy: offer.likedBy,
        userLiked: true
      });
    }

    // Add like
    offer.likes = (offer.likes || 0) + 1;
    offer.likedBy.push(userId);

    // Token reward logic - only for user-generated offers (created by customers)
    let tokensAwarded = 0;
    if (offer.isUserGenerated) {
      // Find the user who created the offer
      const offerCreator = await User.findById(offer.storeId);
      if (offerCreator && offerCreator.role === 'customer') {
        // Calculate tokens: 1 token per 10 likes
        const newTokensEarned = Math.floor(offer.likes / 10);
        const previousTokens = Math.floor((offer.likes - 1) / 10);

        // Only award if new milestone reached
        if (newTokensEarned > previousTokens) {
          tokensAwarded = newTokensEarned - previousTokens;
          offerCreator.snatchTokens = (offerCreator.snatchTokens || 0) + tokensAwarded;
          await offerCreator.save();
        }
      }
    }

    await offer.save();

    res.status(200).json({
      message: 'Offer liked',
      likes: offer.likes,
      likedBy: offer.likedBy,
      tokensAwarded,
      userLiked: true
    });
  } catch (error) {
    console.error('Like Offer Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserOfferStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all offers where this user is the creator (storeId)
    const userOffers = await Offer.find({ storeId: userId });

    // Calculate total likes across all offers
    const totalLikes = userOffers.reduce((sum, offer) => sum + (offer.likes || 0), 0);
    const offerCount = userOffers.length;

    res.status(200).json({
      userId,
      totalLikes,
      offerCount,
      offers: userOffers.map(o => ({
        id: o._id,
        title: o.title,
        likes: o.likes || 0
      }))
    });
  } catch (error) {
    console.error('Get User Offer Stats Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
