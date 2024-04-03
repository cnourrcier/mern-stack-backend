const CustomError = require('../utils/customError');
const { eventLogger } = require('../utils/eventLogger');

const devErrors = (res, err) => {
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message,
        stackTrace: err.stack,
        error: err
    });
}

const castErrorHandler = (err) => {
    const msg = `Invalid value for ${err.path}: ${err.value}!`;
    return new CustomError(msg, 400);
}

const duplicateKeyErrorHandler = (err) => {
    const title = err.keyValue.title;
    console.log(title);
    const msg = `There is already a todo with title ${title}. Please use another title!`;
    return new CustomError(msg, 400);
}

const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map(val => val.message);
    const errorMessages = errors.join(' ');
    const msg = `Invalid input data: ${errorMessages}`;
    return new CustomError(msg, 400);
}

const prodErrors = (res, err) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! Please try again later.'
        });
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    eventLogger(`${err.statusCode}: ${err.message}`, 'errLog.txt');
    if (process.env.NODE_ENV === 'development') {
        devErrors(res, err);
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') err = castErrorHandler(err);
        if (err.code === 11000) err = duplicateKeyErrorHandler(err);
        if (err.name === 'ValidationError') err = validationErrorHandler(err);
        prodErrors(res, err);
    }
}
