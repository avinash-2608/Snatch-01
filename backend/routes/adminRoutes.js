const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Existing store approval routes
router.put('/approve/:userId', adminController.approveStoreOwner);
router.delete('/reject/:userId', adminController.rejectStoreOwner);
router.get('/pending-stores', adminController.getPendingStores);

// ==================== SUBSCRIBERS MANAGEMENT ====================
router.get('/subscribers', adminController.getAllSubscribers);

// ==================== OFFERS MANAGEMENT ====================
router.get('/offers', adminController.getAllOffers);
router.delete('/offers/:offerId', adminController.deleteOffer);

// ==================== STORE OWNERS MANAGEMENT ====================
router.get('/store-owners', adminController.getAllStoreOwners);
router.delete('/store-owners/:id', adminController.deleteStoreOwner);

// ==================== APPROVED SHOPS (FOR BILL PAYMENTS) ====================
router.get('/shops', adminController.getApprovedShops);

// ==================== GOLD EXCLUSIVE OFFERS ====================
router.patch('/offers/:offerId/gold-exclusive', adminController.toggleGoldExclusive);

module.exports = router;
