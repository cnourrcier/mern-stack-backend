const mongoose = require('mongoose');
const validator = require('validator');

// name, email, password, confirmPassword, photo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email.'],
        unique: true,
        lowercase: true, // not a validator. Changes to lowercase before sending to db.
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    photo: {
        type: String // string because I am going to store the path of where the file is stored.
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minLength: 8
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password.']
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;