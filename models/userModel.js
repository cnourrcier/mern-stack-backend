const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
            message: 'Password & Confirm Password do not match!'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
})

// mongoose pre middleware. If password has been modified: encrypt and save. Else: next().
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // encrypt the password before saving it
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

// use for any User query that starts with find
userSchema.pre(/^find/, function (next) {
    // 'this' keyword in the function will point to the current query
    this.find({ isActive: { $ne: false } }); // display any user who's inActive != false.
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

// ecryption for resetPassword should not be as strong as regular password
userSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex'); // 32 characters, hexadecimal string
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // sha256 is algorithm to use, digest() is format of encryption
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Add 10 minutes in milliseconds to current dateTime
    console.log(resetToken, this.passwordResetToken);
    return resetToken; // return unencrypted userToken to user, store encrypted userToken in database
}

const User = mongoose.model('User', userSchema);
module.exports = User;