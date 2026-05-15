const Request = require('../models/Request');
const User = require('../models/User');
const Offer = require('../models/Offer');

exports.createRequest = async (req, res) => {
  try {
    const { storeName, location, offerName, category, userId } = req.body;

    if (!storeName || !location || !offerName || !category || !userId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const store = await User.findOne({ storeName, role: 'store' });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Since our existing database only has single location setup from signup
    if (store.location.toLowerCase() !== location.toLowerCase()) {
      return res.status(400).json({ message: 'Store not available in selected location' });
    }

    const newReq = new Request({
      storeName,
      location,
      offerName,
      category,
      userId,
      storeId: store._id
    });

    await newReq.save();
    res.status(201).json({ message: 'Request created successfully', request: newReq });
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await Request.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get Requests By User Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRequestsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const requests = await Request.find({ storeId, status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get Requests By Store Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, description, offerType } = req.body;

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (!offerType) {
      return res.status(400).json({ message: 'Offer type is required' });
    }

    request.status = 'approved';
    request.startDate = startDate;
    request.endDate = endDate;
    request.description = description;
    await request.save();

    // Create an Offer
    const newOffer = new Offer({
      title: request.offerName,
      category: request.category,
      description,
      startDate,
      endDate,
      storeId: request.storeId,
      createdBy: 'user',
      isUserGenerated: true,
      offerType
    });
    
    await newOffer.save();
    
    res.status(200).json({ message: 'Request approved and offer created', request });
  } catch (error) {
    console.error('Approve Request Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Request rejected', request });
  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getStoreList = async (req, res) => {
  try {
    // Return minimal store info for the dropdowns
    const stores = await User.find({ role: 'store', approved: true }, 'storeName location');
    res.status(200).json(stores);
  } catch (error) {
    console.error('Get Stores Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
