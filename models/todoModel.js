const mongoose = require('mongoose');

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

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;

