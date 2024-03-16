const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.get('/books/search', bookController.getBooksBySearch);

router.get('/books/filter', bookController.getBooksByFilter);

router.get('/books', bookController.getBooks);

router.get('/books/:bookId', bookController.getBook);

router.post('/books', bookController.postBook);

router.put('/books/:bookId', bookController.putBook);

router.delete('/books/:bookId', bookController.deleteBook);

module.exports = router;
