const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const userController = require('../controllers/userController');

// Routes
router.route('/highest-priorities')
    .get(todoController.getHighestRated, todoController.getAllTodos)

router.route('/')
    .get(userController.protect, todoController.getAllTodos)
    .post(todoController.createTodo)

router.route('/:id')
    .get(userController.protect, todoController.getTodoById)
    .put(todoController.updateTodo)
    .delete(todoController.deleteTodo)

module.exports = router;