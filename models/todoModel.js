const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        maxLength: 60, // Max length constraint
        minLength: 1,
        trim: true // Trim leading/trailing whitespace
    },
    description: {
        type: String,
        maxLength: 200, // Max length constraint
        trim: true // Trim leading/trailing whitespace
    },
    priority: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
        default: 1,
        trim: true
    },
    createdBy: String,
    createdAt: {
        type: Date,
        default: function () {
            // Only set the createdAt field if it's not already set
            if (this.isNew) {
                return new Date();
            }
        }
    },
    completed: {
        type: Boolean,
        default: false
    }
});

// DOCUMENT MIDDLEWARE

// pre save hook
// executed before the document is saved in db
// .save() or .create()
todoSchema.pre('save', function (next) {
    // 'this' is pointing to the document that is currently being processed.
    this.createdBy = 'CHARLIE'; // hardcoded for now
    next();
})

// **NOTE: need to update this because it logs the PUT reqs also. This is due to the runValidators option.
// post save hook
// does not have access to 'this'
todoSchema.post('save', function (doc, next) {
    const message = `${doc.title}: created by ${doc.createdBy} | ${doc.createdAt}\n`
    fs.writeFileSync(path.join(__dirname, '..', 'logs', 'dataLog.txt'), message, { flag: 'a' }, (err) => {
        const error = new CustomError(err.message, err.statusCode);
        return next(error);
    });
    next();
})



const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;

