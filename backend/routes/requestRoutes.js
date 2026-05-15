const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/', requestController.createRequest);
router.get('/user/:userId', requestController.getRequestsByUser);
router.get('/store/:storeId', requestController.getRequestsByStore);
router.put('/approve/:id', requestController.approveRequest);
router.put('/reject/:id', requestController.rejectRequest);
router.get('/stores', requestController.getStoreList);

module.exports = router;
