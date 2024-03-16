const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/orders', orderController.getOrders);

router.get('/orders/:orderId', orderController.getOrder);

router.post('/orders', orderController.postOrder);

router.delete('/orders/:orderId', orderController.deleteOrder);

module.exports = router;
