const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');

const authenticate = require('../auth/authenticate');
const { User } = require('../models');

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.findAll({
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt'],
    },
  });

  if (users.length <= 0) {
    return res.sendStatus(404);
  }

  res.status(200).json({ users });
});

exports.getOneUser = [
  param('userId').trim().notEmpty().escape(),
  
  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
    });

    if (!user) {
      return res.sendStatus(404);
    }

    res.status(200).json({ user });
  }),
];

exports.putOneUser = [
  param('userId').trim().notEmpty().escape(),

  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Name must not be greater than 25 characters.')
    .escape(),

  body('username')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Username must not be greater than 25 characters.')
    .toLowerCase()
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .isEmail()
    .withMessage('Invalid email format.')
    .toLowerCase()
    .escape(),

  body('password')
    .notEmpty()
    .withMessage('Password must not be empty.')
    .isStrongPassword()
    .withMessage('Password is not strong enough.')
    .escape(),

  body('passwordConfirmation')
    .notEmpty()
    .withMessage('Password Confirmation must not be empty.')
    .escape()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password does not match.'),

  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const {
      name,
      username,
      email,
      password,
    } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const updatedData = {
      name,
      username,
      email,
      password,
    }

    const [rowsUpdated] = await User.update(updatedData, { where: { id: userId } });

    if (!rowsUpdated) {
      return res.sendStatus(404);
    }

    res.sendStatus(204);
  }),
];

exports.deleteOneUser = [
  param('userId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const rowsDeleted = await User.destroy({
      where: { id: userId },
    });

    if (!rowsDeleted) {
      return res.sendStatus(404);
    }

    res.sendStatus(204);
  }),
];
