const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.route('/')
    .get(userController.protect, userController.restrict('admin'), userController.getAllUsers)

router.route('/signup')
    .post(userController.createUser);

router.route('/login')
    .post(userController.loginUser);

router.route('/:id')
    .get(userController.protect, userController.restrict('admin'), userController.getUserById)
    .put(userController.updateUser)
    .delete(userController.deleteUser)

router.route('/forgotPassword')
    .post(userController.forgotPassword)

router.route('/resetPassword/:token')
    .patch(userController.resetPassword)

router.route('/updatePassword')
    .patch(userController.protect, userController.updatePassword)

router.route('/updateMe')
    .patch(userController.protect, userController.updateMe)

module.exports = router;