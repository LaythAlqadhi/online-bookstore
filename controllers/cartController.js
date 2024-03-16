const asyncHandler = require('express-async-handler');
const { param, validationResult } = require('express-validator');

const authenticate = require('../helpers/authenticate');
const { Book, Cart } = require('../models');

exports.getCarts = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'User') {
      return res.sendStatus(403);
    }

    const carts = await Cart.findAll({
      include: Book,
    });

    if (carts.length <= 0) {
      return res.status(404).json({
        message: 'Carts not found',
      });
    }

    return res.status(200).json({ carts });
  }),
];

exports.getCart = [
  authenticate,

  param('cartId').isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { cartId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const cart = await Cart.findOne({
      where: {
        id: cartId,
        UserId: req.user.id,
      },
      include: Book,
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    return res.status(200).json({ cart: cart.Books });
  }),
];

exports.postBookToCart = [
  authenticate,

  param('cartId').isString().trim().escape(),

  param('bookId').isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { cartId, bookId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const cart = await Cart.findOne({
      where: {
        id: cartId,
        UserId: req.user.id,
      },
    });
    const book = await Book.findByPk(bookId);

    if (!cart || !book) {
      return res.status(404).json({
        message: 'Cart or book not found',
      });
    }
    if (book.status !== 'Available') {
      return res.status(400).json({
        message: `Book is ${book.status.toLowerCase()}`,
      });
    }

    await cart.addBook(book);

    return res.status(200).json({
      message: 'Book added to cart successfully',
    });
  }),
];

exports.deleteBookFromCart = [
  authenticate,

  param('cartId').isString().trim().escape(),

  param('bookId').isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { cartId, bookId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const cart = await Cart.findOne({
      where: {
        id: cartId,
        UserId: req.user.id,
      },
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    await cart.removeBook(bookId);

    return res.status(200).json({
      message: 'Book removed from cart successfully',
    });
  }),
];
