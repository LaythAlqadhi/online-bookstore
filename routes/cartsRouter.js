const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/carts', cartController.getCarts);

router.get('/carts/:cartId', cartController.getCart);

router.post('/carts/:cartId/:bookId', cartController.postBookToCart);

router.delete('/carts/:cartId/:bookId', cartController.deleteBookFromCart);

module.exports = router;
