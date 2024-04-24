const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');
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

// Add security headers to the response
app.use(helmet());

// Prevent brute force and denial of service attacks
const limiter = rateLimit({
    max: 1000, // max number of requests
    windowMs: 60 * 60 * 1000, // timeframe: 1 hour in milliseconds
    message: 'We have received too many requests from this IP. Please try after one hour.'
});

app.use('/api', limiter);

// Log all events 
app.use(reqLogger);

// Read json formatted req data 
app.use(express.json({ limit: '10kb' })); // limits req body to limit. Will truncate the rest of the data. 

// Removes any noSQL query in req.body, req.query, or req.param (aka '$', '.')
app.use(sanitize());

// Prevents xss injections
app.use(xss());

// console.log(app.get('env'));
// console.log(process.env);

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

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


