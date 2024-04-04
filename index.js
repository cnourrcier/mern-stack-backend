const express = require('express');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todoRoutes');
const CustomError = require('./utils/CustomError');
const globalErrorHandler = require('./controllers/errorController');
const { reqLogger } = require('./utils/eventLogger');
const dotenv = require('dotenv');
dotenv.config();

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught exception has occured! Shutting down...');
    // graceful way to shut down. First, give time to close the server, then exit the application.
    process.exit(1);
})

const app = express();

app.use(reqLogger);

// Middleware
app.use(express.json());

// console.log(app.get('env'));
// console.log(process.env);

// Routes
app.use('/api/todos', todoRoutes);

app.all('*', (req, res, next) => {
    const error = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
    next(error);
});

app.use(globalErrorHandler);

// Connect to MongoDB
mongoose.connect(process.env.CONN_STR)
    .then((conn) => {
        // console.log(conn);
        console.log('Connected to MongoDB');
    })

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`))


// each time there is an unhandled rejection anywhere in the NodeJS app,
// the process object will emit an error event called unhandledRejection.
//This process.on will emit an event called unhandledRejection. It will 
// receive an event object which is an err, a rejected promise, and will 
// execute a callback function.
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection has occured! Shutting down...');
    // graceful way to shut down. First, give time to close the server, then exit the application.
    server.close(() => {
        process.exit(1);
    });
})


