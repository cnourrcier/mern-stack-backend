const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// Routes
router.route('/')
    .get(todoController.getAllTodos)
    // .post(validateCreateTodo, todoController.createTodo)
    .post(todoController.createTodo)

router.route('/:id')
    .get(todoController.getTodoById)
    // .put(validateUpdateTodo, todoController.updateTodo)
    .put(todoController.updateTodo)
    .delete(todoController.deleteTodo)

module.exports = router;