const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const userController = require('../controllers/userController');

// Routes
router.route('/')
    .get(userController.protect, todoController.getAllTodos)
    .post(userController.protect, todoController.createTodo)

router.route('/:id')
    .get(userController.protect, todoController.getTodoById)
    .put(userController.protect, todoController.updateTodo)
    .delete(userController.protect, todoController.deleteTodo)

module.exports = router;