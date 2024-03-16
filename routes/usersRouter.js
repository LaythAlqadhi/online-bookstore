const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/users', userController.getUsers);

router.get('/users/:userId', userController.getUser);

router.put('/users/:userId', userController.putUser);

router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
