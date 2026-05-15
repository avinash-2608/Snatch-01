const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Subscription payment routes (existing)
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

// Bill payment routes (new)
router.post('/create-bill-order', paymentController.createBillOrder);
router.post('/verify-bill', paymentController.verifyBillPayment);
router.get('/history/:userId', paymentController.getUserPayments);

module.exports = router;
