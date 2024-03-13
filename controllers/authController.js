const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const { User } = require('../models');

exports.postSignUp = [
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
    const {
      name,
      username,
      email,
      password,
    } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({ errors: errors.array() });
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
  body('username').trim().notEmpty().toLowerCase().escape(),

  body('password').trim().notEmpty().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({ errors: errors.array() });
     }

    next();
  },
  
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '6h',
    });

    const user = {
      id: req.user.id,
      name: req.user.name,
      username: req.user.username,
    };

    const payload = { token, user };
    res.status(200).json({ payload });
  },
];
