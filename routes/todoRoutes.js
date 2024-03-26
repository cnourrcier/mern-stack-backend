const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { validateCreateTodo, validateUpdateTodo } = require('../middleware/todoValidation');

// Routes
router.get('/', todoController.getAllTodos);
router.get('/:id', todoController.getTodoById);
router.post('/', validateCreateTodo, todoController.createTodo);
router.put('/:id', validateUpdateTodo, todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;