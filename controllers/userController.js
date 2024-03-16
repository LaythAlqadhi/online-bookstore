const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');

const authenticate = require('../helpers/authenticate');
const { User, Cart, Order } = require('../models');

exports.getUsers = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const users = await User.findAll({
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
      include: [
        {
          model: Cart,
          attributes: ['id'],
        },
        {
          model: Order,
          attributes: ['id'],
        },
      ],
    });

    if (users.length <= 0) {
      return res.status(404).json({
        message: 'Users not found',
      });
    }

    return res.status(200).json({ users });
  }),
];

exports.getUser = [
  authenticate,

  param('userId').isString().trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
      include: [
        {
          model: Cart,
          attributes: ['id'],
        },
        {
          model: Order,
          attributes: ['id'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({ user });
  }),
];

exports.putUser = [
  authenticate,

  param('userId').isString().trim().notEmpty().escape(),

  body('name')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Name must not be greater than 25 characters.')
    .escape(),

  body('username')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Username must not be greater than 25 characters.')
    .toLowerCase()
    .escape(),

  body('email')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('Invalid email format.')
    .toLowerCase()
    .escape(),

  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password must not be empty.')
    .isStrongPassword()
    .withMessage('Password is not strong enough.')
    .escape(),

  body('passwordConfirmation')
    .isString()
    .notEmpty()
    .withMessage('Password Confirmation must not be empty.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password does not match.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { name, username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (req.user.id !== userId && req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const updatedData = { name, username, email, password };

    const [rowsUpdated] = await User.update(updatedData, {
      where: { id: userId },
    });

    if (!rowsUpdated) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'User updated successfully',
    });
  }),
];

exports.deleteUser = [
  authenticate,

  param('userId').isString().trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (req.user.id !== userId && req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const rowsDeleted = await User.destroy({
      where: { id: userId },
    });

    if (!rowsDeleted) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
    });
  }),
];
