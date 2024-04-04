const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// Routes
router.route('/highest-priorities')
    .get(todoController.getHighestRated, todoController.getAllTodos)

router.route('/')
    .get(todoController.getAllTodos)
    .post(todoController.createTodo)

router.route('/:id')
    .get(todoController.getTodoById)
    .put(todoController.updateTodo)
    .delete(todoController.deleteTodo)

module.exports = router;