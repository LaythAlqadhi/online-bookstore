const asyncHandler = require('express-async-handler');
const { body, param, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const authenticate = require('../helpers/authenticate');
const { Book } = require('../models');

exports.getBooksBySearch = [
  authenticate,

  query('q').optional().isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { q } = req.query;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (q === '') {
      return res.status(200).json({ books: [] });
    }

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
        ],
      },
    });

    return res.status(200).json({ books });
  }),
];

exports.getBooksByFilter = [
  authenticate,

  query('genre').optional().isString().trim().escape(),

  query('status').optional().isString().trim().escape(),

  query('maxPrice').optional().isString().trim().escape(),

  query('minPrice').optional().isString().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { genre, status, maxPrice, minPrice } = req.query;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const whereClause = {};

    if (genre) {
      whereClause.genre = genre;
    }
    if (status) {
      whereClause.status = status;
    }
    if (maxPrice) {
      whereClause.price = { [Op.lte]: parseInt(maxPrice) };
    }
    if (minPrice) {
      whereClause.price = { [Op.gte]: parseInt(minPrice) };
    }

    const books = await Book.findAll({ where: whereClause });

    return res.status(200).json({ books });
  }),
];

exports.getBooks = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const books = await Book.findAll();

    if (books.length <= 0) {
      return res.sendStatus(404);
    }

    return res.status(200).json({ books });
  }),
];

exports.getBook = [
  authenticate,

  param('bookId').trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { bookId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    const book = await Book.findOne({ where: { id: bookId } });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }

    return res.status(200).json({ book });
  }),
];

exports.postBook = [
  authenticate,

  body('title')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Title must not be less than 2 characters.')
    .isLength({ max: 100 })
    .withMessage('Title must not be greater than 100 characters.')
    .escape(),

  body('author')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Author name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Author name must not be greater than 25 characters.')
    .escape(),

  body('genre')
    .isString()
    .trim()
    .notEmpty()
    .isIn([
      'Mystery',
      'Science',
      'Fantasy',
      'Historical',
      'Romance',
      'Horror',
      'Business',
      'Travel',
      'Other',
    ])
    .escape(),

  body('price').isNumeric().trim().notEmpty().escape(),

  body('status')
    .isString()
    .trim()
    .notEmpty()
    .isIn(['Available', 'Borrowed', 'Out of Stock'])
    .escape(),

  asyncHandler(async (req, res, next) => {
    const { title, author, genre, price, status } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const newData = { title, author, genre, price, status };

    const book = await Book.create(newData);

    return res.status(200).json({ book });
  }),
];

exports.putBook = [
  authenticate,

  param('bookId').isString().trim().notEmpty().escape(),

  body('title')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Title must not be less than 2 characters.')
    .isLength({ max: 100 })
    .withMessage('Title must not be greater than 100 characters.')
    .escape(),

  body('author')
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Author name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Author name must not be greater than 25 characters.')
    .escape(),

  body('genre')
    .isString()
    .trim()
    .notEmpty()
    .isIn([
      'Mystery',
      'Science',
      'Fantasy',
      'Historical',
      'Romance',
      'Horror',
      'Business',
      'Travel',
      'Other',
    ])
    .escape(),

  body('price').isNumeric().trim().notEmpty().escape(),

  body('status')
    .isString()
    .trim()
    .notEmpty()
    .isIn(['Available', 'Borrowed', 'Out of Stock'])
    .escape(),

  asyncHandler(async (req, res, next) => {
    const { bookId } = req.params;
    const { title, author, genre, price, status } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const updatedData = { title, author, genre, price, status };

    const [rowsUpdated] = await Book.update(updatedData, {
      where: { id: bookId },
    });

    if (!rowsUpdated) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }

    return res.status(200).json({
      message: 'Book updated successfully',
    });
  }),
];

exports.deleteBook = [
  authenticate,

  param('bookId').isString().trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const { bookId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const rowsDeleted = await Book.destroy({
      where: { id: bookId },
    });

    if (!rowsDeleted) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }

    return res.status(200).json({
      message: 'Book deleted successfully',
    });
  }),
];
