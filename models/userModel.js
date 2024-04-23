const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minLength: 8,
        select: false // hide password.
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password.'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Password & Confirm Password does not match!'
        }
    },
    passwordChangedAt: {
        type: Date
    }
})

// mongoose pre middleware. If password has been modified: encrypt and save. Else: next().
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // encrypt the password before saving it
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

// Instance method for all instances of User model.
userSchema.methods.comparePasswordInDb = async function (pwd, pwdDb) {
    //Check if submitted password matches db password.
    return await bcrypt.compare(pwd, pwdDb);
}

userSchema.methods.isPasswordChanged = async function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        // Convert datetime to timestamp in seconds, base 10.
        const pwdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(pwdChangedTimestamp, jwtTimestamp);
        // If password was changed after jwt, return true. Else, return false.
        return jwtTimestamp < pwdChangedTimestamp;
    }
    return false;
}

const User = mongoose.model('User', userSchema);
module.exports = User;