const { body, validationResult } = require('express-validator');

maxTitleLength = 60;
maxDescriptionLength = 200;

// Check for validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        // Extract detailed error messages into an array
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg
        }))
        console.log(errorMessages);
        // Return 400 Bad Request with validation errors
        return res.status(400).json({ errors: errorMessages });
    }
    // Validation passed, proceed to next middleware/route handler
    next();
}

// Array of validation middleware functions for creating a new todo.
// Within each middleware function, req, res, and next are passed implicitly 
// by Express.js when the middleware function is called.
const validateCreateTodo = [
    // Validate todo title
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: maxTitleLength }).withMessage('Title cannot be more than 30 characters')
        .escape(),

    // Validate todo description (optional)
    body('description')
        .optional()
        .trim()
        .isString().withMessage('Description must be a string')
        .isLength({ max: maxDescriptionLength }).withMessage('Description cannot be more than 200 characters')
        .escape(),

    handleValidationErrors
];

// Array of validation middleware functions for updating a todo.
// Within each middleware function, req, res, and next are passed implicitly 
// by Express.js when the middleware function is called.
const validateUpdateTodo = [
    // Validate todo title (optional)
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: maxTitleLength }).withMessage('Title cannot be more than 30 characters')
        .escape(),

    // Validate todo description (optional)
    body('description')
        .optional()
        .trim()
        .isString().withMessage('Description must be a string')
        .isLength({ max: maxDescriptionLength }).withMessage('Description cannot be more than 200 characters')
        .escape(),

    // Check for validation errors
    handleValidationErrors
]

module.exports = { validateCreateTodo, validateUpdateTodo };