const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Online Bookstore' });
});

module.exports = router;
