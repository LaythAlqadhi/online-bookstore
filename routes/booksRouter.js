const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.get('/books/search', bookController.getBooksBySearch);

router.get('/books/filter', bookController.getBooksByFilter);

router.get('/books', bookController.getAllBooks);

router.get('/books/:bookId', bookController.getOneBook);

router.post('/books', bookController.postOneBook);

router.put('/books/:bookId', bookController.putOneBook);

router.delete('/books/:bookId', bookController.deleteOneBook);

module.exports = router;
