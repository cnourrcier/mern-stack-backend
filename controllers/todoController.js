const Todo = require('../models/todoModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CustomError = require('../utils/customError');

exports.getAllTodos = asyncErrorHandler(async (req, res, next) => {
    
    const todos = await Todo.find();
    res.status(200).json({
        status: 'success',
        data: {
            todos
        }
    });
});

exports.getTodoById = asyncErrorHandler(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
        const error = new CustomError('Todo with that ID is not found', 404);
        // next sends the error to the global error handling middleware (GEHM)
        // return so that the rest of the code below 'next(error)' does not run after calling the GEHM
        return next(error);
    }
    res.status(200).json({
        status: 'success',
        data: {
            todo
        }
    })
});

exports.createTodo = asyncErrorHandler(async (req, res, next) => {
    const newTodo = await Todo.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            newTodo
        }
    });
});

exports.updateTodo = asyncErrorHandler(async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
        const error = new CustomError('Todo with that ID is not found', 404);
        return next(error);
    }
    todo.title = req.body.title || todo.title;
    todo.description = req.body.description || todo.description;
    todo.completed = req.body.completed || todo.completed;
    const updatedTodo = await todo.save();
    res.status(200).json({
        status: 'success',
        data: {
            updatedTodo
        }
    });
});

exports.deleteTodo = async (req, res, next) => {
    // will return a deleted todo object if successfully deleted. If ID is not found, will return null.
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
        const error = new CustomError('Todo with that ID is not found', 404);
        return next(error);
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}

