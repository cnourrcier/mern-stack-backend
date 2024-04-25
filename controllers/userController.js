const User = require('../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const CustomError = require('../utils/CustomError');
const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const signToken = (id) => {
    // create a jwt: pass the payload and secret string to the sign function.
    // header will be automatically created by the sign function.
    // The more properties passed in the payload, the more secure the token will be.
    return jwt.sign({ id: id }, process.env.SECRET_STR, { expiresIn: process.env.LOGIN_EXPIRES });
};

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);
    const options = {
        expiresIn: process.env.LOGIN_EXPIRES,
        httpOnly: true // restrict browers from accessing or modifying the cookie, to prevent cross site scripting attack.
    }
    if (process.env.NODE_ENV === 'production') {
        options.secure = true; // will only be sent on https
    }
    // pass jwt in http cookie
    res.cookie('jwt', token, options);
    user.password = undefined; // password is already saved in db. Set to undefined before sending to client.
    res.status(statusCode).json({
        status: 'success',
        message: 'Success!',
        token,
        data: {
            user
        }
    });
};

const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        };
    });
    return newObj;
};

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find();
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
    createSendResponse(newUser, 201, res);
});

exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    // Check if email & password are present in req body.
    const { email, password } = req.body;
    if (!email || !password) {
        const error = new CustomError('Please provide email ID and Password for login!', 400); // unauthorized
        return next(error);
    };
    // Check if user exists with given email.
    const user = await User.findOne({ email: email }).select('+password'); //select function to include password.
    // Check if user exists first, and if so then check if passwords match.
    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
        const error = new CustomError('Incorrect email or password.', 400); // unauthorized
        return next(error);
    };
    createSendResponse(user, 200, res);
});

exports.getUserById = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        const error = new CustomError('User with that ID is not found', 404);
        // next sends the error to the global error handling middleware (GEHM)
        // return so that the rest of the code below 'next(error)' does not run after calling the GEHM
        return next(error);
    };
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});


// Permanent delete
exports.deleteUser = async (req, res, next) => {
    // will return a deleted user object if successfully deleted. If ID is not found, will return null.
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        const error = new CustomError('User with that ID is not found', 404);
        return next(error);
    };
    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.protect = asyncErrorHandler(async (req, res, next) => {
    // Read the token and check if it exists.
    const testToken = req.headers.authorization;
    let token;
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1];
    };
    if (!token) {
        next(new CustomError('You are not logged in!', 401)); // Unauthorized.
    };
    // Validate the token.
    // Async function, but does not return a promise. 
    // Need to promisify it so that it returns a promise.
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
    // Check if the user exists in the database.
    const user = await User.findById(decodedToken.id);
    if (!user) {
        next(new CustomError('The user with the given token does not exist.', 401)); // Unauthorized
    };
    // Check if the user changed password after the token was issued.
    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    if (isPasswordChanged) {
        return next(new CustomError('The password has been changed. Please login again.', 401));
    };
    // Pass user obj to req.user and allow user to access route.
    req.user = user;
    next();
});

exports.restrict = (role) => { // Create a wrapper function that returns a middleware function because need to pass in role.
    return (req, res, next) => {
        if (role !== req.user.role) { // req.user is created in the protect middleware and passed to the next middleware, aka this one. 
            const error = new CustomError('You do not have permission to perform this action.', 403) // Forbidden
            next(error);
        };
        next();
    };
};

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

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    // Get user based on posted email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        const error = new CustomError('User with that email could not be found.', 404); // Not found
        next(error);
    };
    // Generate a random reset token
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // disable pre middleware for saving, bc don't need to confirm password.
    // Send email to user with reset token
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`; // protocol is either http or https. req.get('host') will return the host (ex: localhost:3000)
    const message = `We have received a password reset request. Please use the below link to reset your password.\n\n${resetUrl}\n\nThis reset password link will only be valid for 10 minutes.`;
    // if receive a rejected promise, send to global error handler AFTER removing values from passwordResetToken and pRTE in database.
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password change request',
            message: message
        });
        res.status(200).json({
            status: 'success',
            message: 'password link sent to the user email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({ validateBeforeSave: false });
        return next(new CustomError('There was an error sending password reset email. Please try again later.', 500)); // Internal server error
    };
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    // If the user exists with the given token & token has not expired 
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });
    if (!user) {
        const error = new CustomError('Token is invalid or has expired.', 400);
        next(error);
    };
    // Reset the user password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    // Login the user
    createSendResponse(user, 200, res);
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    // Get current user data from database
    const user = await User.findById(req.user._id).select('+password'); // we get req.user from protect middleware that runs before this function.
    // Check if the supplied current password is correct
    if (!(await user.comparePasswordInDb(req.body.currentPassword, user.password))) {
        return next(new CustomError('Password is incorrect.', 401)) // Bad request
    };
    // If supplied password is correct, update user password with new value
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    // Login user & send jwt
    createSendResponse(user, 200, res);
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
    // Check if request data contains password or confirmPassword
    if (req.body.password || req.body.confirmPassword) {
        return next(new CustomError('You cannot update your password using this endpoint.', 400)) // Bad request
    };
    // Update user details
    const filterObj = filterReqObj(req.body, 'name', 'email');
    console.log(typeof req.user.id);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, { runValidators: true, new: true }); // protect middleware will be run first and will past the req.user obj.
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Soft delete
exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { isActive: false }); // protect middleware will be run first and will past the req.user obj.
    res.status(204).json({ // Deleted (soft delete)
        status: 'success',
        data: null
    });
});