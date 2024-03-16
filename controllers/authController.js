const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { User } = require('../models');

exports.postSignUp = [
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
    const { name, username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    res.status(200).json({ user });
  }),
];

exports.postSignIn = [
  body('username').isString().trim().notEmpty().toLowerCase().escape(),

  body('password').isString().trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      res.status(401).json({
        message: 'Incorrect username',
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(401).json({
        message: 'Incorrect password',
      });
    }

    const accessToken = jwt.sign(
      user.toJSON(),
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' },
    );

    res.status(200).json({ accessToken, refreshToken });
  }),
];

exports.postRefresh = [
  body('refreshToken').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token missing',
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            message: 'Unauthorized',
          });
        }

        const accessToken = jwt.sign(
          decoded.toJSON(),
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' },
        );

        res.status(200).json({ accessToken });
      },
    );
  }),
];
