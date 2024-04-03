const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { validateCreateTodo, validateUpdateTodo } = require('../middleware/todoValidation');

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