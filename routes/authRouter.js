const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/auth/signup', authController.postSignUp);

router.post('/auth/signin', authController.postSignIn);

module.exports = router;
