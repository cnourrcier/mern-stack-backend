const Todo = require('../models/todoModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CustomError = require('../utils/CustomError');
const ApiFeatures = require('../utils/ApiFeatures');


exports.getAllTodos = asyncErrorHandler(async (req, res, next) => {
    // find all the todos that the current user created
    const todos = await Todo.find({ createdBy: req.user.id }); // req.user is passed from userController.protect

    res.status(200).json({
        status: 'success',
        length: todos.length,
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
    };
    if (req.user._id.toString() !== todo.createdBy.toString()) { // Convert to string to compare object value equality instead of reference equality.
        const error = new CustomError('User does not have a todo with that ID.', 400); // Unauthorized
        return next(error);
    };
    res.status(200).json({
        status: 'success',
        data: {
            todo
        }
    });
});

exports.createTodo = asyncErrorHandler(async (req, res, next) => {
    // User obj linked to Todo createdBy field
    req.body.createdBy = req.user.id; // userController.protect is called first, and passes req.user here.
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
    // current user does not have access to modify other users' todos
    if (req.user._id.toString() !== todo.createdBy.toString()) { // Convert to string to compare object value equality instead of reference equality.
        const error = new CustomError('User does not have a todo with that ID.', 400); // Unauthorized
        return next(error);
    }
    const updatedTodo = await todo.updateOne(req.body, { new: true, runValidators: true })
    res.status(200).json({
        status: 'success',
        data: {
            updatedTodo
        }
    });
});

exports.deleteTodo = async (req, res, next) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
        const error = new CustomError('Todo with that ID is not found', 404);
        return next(error);
    }
    // current user does not have access to delete other users' todos
    if (req.user._id.toString() !== todo.createdBy.toString()) { // Convert to string to compare object value equality instead of reference equality.
        const error = new CustomError('User does not have a todo with that ID.', 400); // Unauthorized
        return next(error);
    }
    // Delete todo document from collection
    const deletedTodo = await Todo.deleteOne(todo);
    console.log(deletedTodo);
    res.status(204).json({
        status: 'success',
        data: null
    });
}

