const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.route('/signup')
    .post(userController.createUser);

router.route('/')
    .get(userController.getAllUsers)

router.route('/:id')
    .get(userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;