const User = require('../models/User');
const Offer = require('../models/Offer');
const Subscriber = require('../models/Subscriber');

exports.approveStoreOwner = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'store') {
      return res.status(400).json({ message: 'User is not a store owner' });
    }

    user.approved = true;
    await user.save();

    res.status(200).json({ message: 'Store owner approved successfully', user });
  } catch (error) {
    console.error('Approve Store Owner Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPendingStores = async (req, res) => {
  try {
    const pendingStores = await User.find({ role: 'store', approved: false }).sort({ createdAt: -1 });
    res.status(200).json(pendingStores);
  } catch (error) {
    console.error('Get Pending Stores Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.rejectStoreOwner = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'store') {
      return res.status(400).json({ message: 'User is not a store owner' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Store owner rejected and removed' });
  } catch (error) {
    console.error('Reject Store Owner Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==================== SUBSCRIBERS MANAGEMENT ====================

// Get all Snatch Gold subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    console.log('Admin: Fetching all subscribers');
    const subscribers = await Subscriber.find()
      .sort({ subscribedAt: -1 })
      .lean();
    
    console.log(`Admin: Found ${subscribers.length} subscribers`);
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Get All Subscribers Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==================== OFFERS MANAGEMENT ====================

// Get all offers (both store and customer created)
exports.getAllOffers = async (req, res) => {
  try {
    console.log('Admin: Fetching all offers');
    const offers = await Offer.find()
      .populate('storeId', 'name email storeName')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Admin: Found ${offers.length} offers`);
    res.status(200).json(offers);
  } catch (error) {
    console.error('Get All Offers Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete an offer by ID
exports.deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    if (!offerId) {
      return res.status(400).json({ message: 'offerId is required' });
    }
    
    console.log(`Admin: Deleting offer ${offerId}`);
    
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    await Offer.findByIdAndDelete(offerId);
    console.log(`Admin: Offer ${offerId} deleted successfully`);
    
    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete Offer Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==================== STORE OWNERS MANAGEMENT ====================

// Get all store owners
exports.getAllStoreOwners = async (req, res) => {
  try {
    console.log('Admin: Fetching all store owners');
    const storeOwners = await User.find({ role: 'store' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Admin: Found ${storeOwners.length} store owners`);
    res.status(200).json(storeOwners);
  } catch (error) {
    console.error('Get All Store Owners Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete store owner and all their offers
exports.deleteStoreOwner = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Store owner id is required' });
    }
    
    console.log(`Admin: Deleting store owner ${id}`);
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Store owner not found' });
    }
    
    if (user.role !== 'store') {
      return res.status(400).json({ message: 'User is not a store owner' });
    }
    
    // Delete all offers by this store owner
    const deleteOffersResult = await Offer.deleteMany({ storeId: id });
    console.log(`Admin: Deleted ${deleteOffersResult.deletedCount} offers from store owner ${id}`);
    
    // Delete the store owner
    await User.findByIdAndDelete(id);
    console.log(`Admin: Store owner ${id} deleted successfully`);
    
    res.status(200).json({ 
      message: 'Store owner and all their offers deleted successfully',
      deletedOffersCount: deleteOffersResult.deletedCount
    });
  } catch (error) {
    console.error('Delete Store Owner Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==================== SHOPS FOR BILL PAYMENTS ====================

// Get all approved stores (for bill payments)
exports.getApprovedShops = async (req, res) => {
  try {
    console.log('Fetching approved shops for bill payments');
    const shops = await User.find({ 
      role: 'store', 
      approved: true 
    })
      .select('_id storeName location email phone')
      .sort({ storeName: 1 })
      .lean();
    
    console.log(`Found ${shops.length} approved shops`);
    res.status(200).json(shops);
  } catch (error) {
    console.error('Get Approved Shops Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==================== GOLD EXCLUSIVE OFFERS ====================

// Toggle isGoldExclusive for an offer
exports.toggleGoldExclusive = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    if (!offerId) {
      return res.status(400).json({ message: 'offerId is required' });
    }
    
    console.log(`Admin: Toggling Gold Exclusive for offer ${offerId}`);
    
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    // Toggle the isGoldExclusive field
    offer.isGoldExclusive = !offer.isGoldExclusive;
    await offer.save();
    
    console.log(`Admin: Offer ${offerId} isGoldExclusive set to ${offer.isGoldExclusive}`);
    
    res.status(200).json({
      message: `Offer ${offer.isGoldExclusive ? 'marked as' : 'removed from'} Gold Exclusive`,
      isGoldExclusive: offer.isGoldExclusive,
      offer
    });
  } catch (error) {
    console.error('Toggle Gold Exclusive Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
