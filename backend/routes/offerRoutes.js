const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');

router.post('/', offerController.createOffer);
router.get('/', offerController.getAllOffers);
router.get('/store/:storeId', offerController.getOffersByStore);
router.put('/like/:offerId', offerController.likeOffer);
router.get('/stats/:userId', offerController.getUserOfferStats);

module.exports = router;
