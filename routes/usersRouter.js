const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/users', userController.getAllUsers);
router.get('/users/:userId', userController.getOneUser);
router.put('/users/:userId', userController.putOneUser);
router.delete('/users/:userId', userController.deleteOneUser);

module.exports = router;
