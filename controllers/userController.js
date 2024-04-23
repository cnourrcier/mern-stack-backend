const User = require('../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CustomError = require('../utils/CustomError');
const ApiFeatures = require('../utils/ApiFeatures');
const jwt = require('jsonwebtoken');
const util = require('util');

const signToken = (id) => {
    // create a jwt: pass the payload and secret string to the sign function.
    // header will be automatically created by the sign function.
    // The more properties passed in the payload, the more secure the token will be.
    return jwt.sign({ id: id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const features = new ApiFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const users = await features.query;

    res.status(200).json({
        status: 'success',
        length: users.length,
        data: {
            users
        }
    });
});

exports.createUser = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    });
});

exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    // Check if email & password are present in req body.
    const { email, password } = req.body;
    if (!email || !password) {
        const error = new CustomError('Please provide email ID and Password for login!', 400); // unauthorized
        return next(error);
    }
    // Check if user exists with given email.
    const user = await User.findOne({ email: email }).select('+password'); //select function to include password.
    // Check if user exists first, and if so then check if passwords match.
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
        const error = new CustomError('Incorrect email or password.', 400); // unauthorized
        return next(error);
    }
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: token
    })
});

exports.getUserById = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        const error = new CustomError('User with that ID is not found', 404);
        // next sends the error to the global error handling middleware (GEHM)
        // return so that the rest of the code below 'next(error)' does not run after calling the GEHM
        return next(error);
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});

exports.updateUser = asyncErrorHandler(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updatedUser) {
        const error = new CustomError('User with that ID is not found', 404);
        return next(error);
    }
    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    });
});

exports.deleteUser = async (req, res, next) => {
    // will return a deleted user object if successfully deleted. If ID is not found, will return null.
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        const error = new CustomError('User with that ID is not found', 404);
        return next(error);
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}

exports.protect = asyncErrorHandler(async (req, res, next) => {
    // 1. Read the token and check if it exists.
    const testToken = req.headers.authorization;
    let token;
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    }
    if (!token) {
        next(new CustomError('You are not logged in!', 401)); // Unauthorized.
    }
    // 2. Validate the token.
    // Async function, but does not return a promise. 
    // Need to promisify it so that it returns a promise.
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
    // 3. Check if the user exists in the database.
    const user = await User.findById(decodedToken.id);
    if (!user) {
        next(new CustomError('The user with the given token does not exist.', 401)) // Unauthorized
    }
    // 4. Check if the user changed password after the token was issued.
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    if (isPasswordChanged) {
        return next(new CustomError('The password has been changed. Please login again.', 401))
    }
    // 5. Allow user to access route.
    req.user = user;
    next();
})

exports.restrict = (role) => { // Create a wrapper function that returns a middleware function because need to pass in role.
    return (req, res, next) => {
        if (role !== req.user.role) { // req.user is created in the protect middleware and passed to the next middleware, aka this one. 
            const error = new CustomError('You do not have permission to perform this action.', 403) // Forbidden
            next(error);
        }
        next();
    }
}

// This restrict middleware can be used in place of the one above when you have multiple roles that can perform restricted actions. 
// Create a wrapper function that returns a middleware function because need to pass in role.
// exports.restrict = (...role) => { // rest parameter: (...role) means multiple values can be passed to this parameter, and the parameter will be an array.  
//     return (req, res, next) => {
//         if (!role.includes(req.user.role)) { // req.user is created in the protect middleware and passed to the next middleware, aka this one. 
//             const error = new CustomError('You do not have permission to perform this action.', 403) // Forbidden
//             next(error);
//         }
//         next();
//     }
// }




