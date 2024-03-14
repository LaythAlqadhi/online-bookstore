const asyncHandler = require('express-async-handler');
const { body, param, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const authenticate = require('../helpers/authenticate');
const { Book } = require('../models');

exports.getBooksBySearch = [
  authenticate,

  query('query').trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { query } = req.query;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: 'Invalid input',
        errors: errors.array(),
      });
    }

    if (query === '') {
      return res.status(200).json({ books: [] });
    }

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { author: { [Op.iLike]: `%${query}%` } }
        ],
      },
    });

    return res.status(200).json({ books });
  }),
];

exports.getBooksByFilter = [
  authenticate,

  query('genre')
    .optional()
    .trim()
    .escape(),

  query('status')
    .optional()
    .trim()
    .escape(),

  query('maxPrice')
    .optional()
    .trim()
    .escape(),

  query('minPrice')
    .optional()
    .trim()
    .escape(),
  
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

    const books = await Book.findAll({
      where: whereClause
    });

    return res.status(200).json({ books });
  }),
];

exports.getAllBooks = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const books = await Book.findAll();

    if (books.length <= 0) {
      return res.sendStatus(404);
    }

    return res.status(200).json({ books });
  }),
];

exports.getOneBook = [
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

    const book = await Book.findOne({
      where: { id: bookId },
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
    });

    if (!book) {
      return res.sendStatus(404);
    }

    return res.status(200).json({ book });
  }),
];

exports.postOneBook = [
  authenticate,

  body('title')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Title must not be less than 2 characters.')
    .isLength({ max: 100 })
    .withMessage('Title must not be greater than 100 characters.')
    .escape(),

  body('author')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Author name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Author name must not be greater than 25 characters.')
    .escape(),

  body('author')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Author name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Author name must not be greater than 25 characters.')
    .escape(),

  body('genre')
    .trim()
    .notEmpty()
    .isIn(['Mystery', 'Science', 'Fantasy', 'Historical', 'Romance', 'Horror', 'Business', 'Travel', 'Other'])
    .escape(),

  body('price')
    .trim()
    .notEmpty()
    .isNumeric()
    .escape(),

  body('status')
    .trim()
    .notEmpty()
    .isIn(['Available', 'Borrowed', 'Out of Stock'])
    .escape(),

  asyncHandler(async (req, res, next) => {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      price,
      status,
    } = req.body;
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

    const newData = {
      title,
      author,
      genre,
      price,
      status,
    }

    const book = await Book.create(newData);

    return res.status(200).json({ book });
  }),
];

exports.putOneBook = [
  authenticate,

  param('bookId')
    .trim()
    .notEmpty()
    .escape(),

  body('title')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Title must not be less than 2 characters.')
    .isLength({ max: 100 })
    .withMessage('Title must not be greater than 100 characters.')
    .escape(),

  body('author')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Author name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Author name must not be greater than 25 characters.')
    .escape(),

  body('author')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Author name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Author name must not be greater than 25 characters.')
    .escape(),

  body('genre')
    .trim()
    .notEmpty()
    .isIn(['Mystery', 'Science', 'Fantasy', 'Historical', 'Romance', 'Horror', 'Business', 'Travel', 'Other'])
    .escape(),

  body('price')
    .trim()
    .notEmpty()
    .isNumeric()
    .escape(),

  body('status')
    .trim()
    .notEmpty()
    .isIn(['Available', 'Borrowed', 'Out of Stock'])
    .escape(),

  asyncHandler(async (req, res, next) => {
    const { bookId } = req.params;
    const {
      title,
      author,
      genre,
      price,
      status,
    } = req.body;
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

    const updatedData = {
      title,
      author,
      genre,
      price,
      status,
    }

    const [rowsUpdated] = await Book.update(updatedData, { where: { id: bookId } });

    if (!rowsUpdated) {
      return res.sendStatus(404);
    }

    return res.status(200).json({
      message: 'Book updated successfully'
    });
  }),
];

exports.deleteOneBook = [
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

    if (req.user.role !== 'Admin') {
      return res.sendStatus(403);
    }

    const rowsDeleted = await Book.destroy({
      where: { id: bookId },
    });

    if (!rowsDeleted) {
      return res.sendStatus(404);
    }

    return res.status(200).json({
      message: 'Book deleted successfully'
    });
  }),
];
