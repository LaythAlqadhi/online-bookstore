const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');

const authenticate = require('../helpers/authenticate');
const { Book, Cart, Order } = require('../models');

exports.getOrders = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const orders = await Order.findAll({
      include: Book,
    });

    if (!orders) {
      return res.status(404).json({
        message: 'Orders not found',
      });
    }

    return res.status(200).json({ orders });
  }),
];

exports.getOrder = [
  authenticate,

  param('orderId').isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const order = await Order.findOne({
      where: {
        id: orderId,
        UserId: req.user.id,
      },
      include: Book,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    return res.status(200).json({ order });
  }),
];

exports.postOrder = [
  authenticate,

  body('name')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Name must not be greater than 25 characters.')
    .escape(),

  body('address')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Address must not be less than 2 characters.')
    .isLength({ max: 100 })
    .withMessage('Address must not be greater than 100 characters.')
    .escape(),

  body('phone').isString().trim().notEmpty().escape(),

  body('instructions')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 25 })
    .withMessage('Instructions must not be less than 25 characters.')
    .isLength({ max: 1000 })
    .withMessage('Instructions must not be greater than 1000 characters.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const { name, address, phone, instructions } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const cart = await Cart.findOne({
      where: { UserId: req.user.id },
      include: Book,
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }
    if (cart.Books.length === 0) {
      return res.status(404).json({
        message: 'Books not found',
      });
    }

    const totalAmount = cart.Books.reduce(
      (total, book) => total + book.price,
      0,
    );

    const order = await Order.create({
      totalAmount,
      name,
      address,
      phone,
      instructions,
      UserId: req.user.id,
    });

    await Promise.all(
      cart.Books.map(async (book) => {
        await order.addBook(book);
        await book.update({ status: 'Borrowed' });
      }),
    );

    await cart.setBooks([]);

    return res.status(200).json({
      message: 'Checked out successfully',
    });
  }),
];

exports.deleteOrder = [
  authenticate,

  param('orderId').isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const order = await Order.findOne({
      where: {
        id: orderId,
        UserId: req.user.id,
      },
      include: Book,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    await Promise.all(
      order.Books.map(async (book) => {
        await book.update({ status: 'Available' });
      }),
    );

    await order.destroy();

    return res.status(200).json({
      message: 'Order removed successfully',
    });
  }),
];
