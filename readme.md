# Task Manager

This project is a simple backend implementation of a RESTful API using the MERN (MongoDB, Express.js, Node.js) stack. It provides CRUD (Create, Read, Update, Delete) operations for managing todos.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Logging](#logging)
- [Next Steps](#next-steps)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used

- MongoDB: A NoSQL database used to store todo data.
- Express.js: A backend framework for Node.js used to create RESTful API endpoints.
- Node.js: A JavaScript runtime environment used to run the server-side code.
- Mongoose: An Object Data Modeling (ODM) library for MongoDB and Node.js used for schema-based modeling and validation.
- uuid: A library used to generate universally unique identifiers (UUIDs).
- date-fns: A library for date and time manipulation in JavaScript.
- dotenv: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.
- bcrypt: A library for hashing passwords. 
- jsonwebtoken: A library used for secure authentication and data transmission between client and server.
- validator: A library of string validators and sanitizers.
- nodemailer: A module for node.js to send emails.
- express-rate-limit: Middleware for Express used to limit repeated requests to public APIs and/or endpoints such as password reset.

## Project Structure

The project follows a standard MVC (Model-View-Controller) pattern for organizing code:

- **models/**: Contains the MongoDB schema definitions for todos.
- **controllers/**: Contains the logic for handling todo-related CRUD operations.
- **routes/**: Contains the route definitions for todo API endpoints.
- **index.js**: The entry point of the application where the Express server is initialized and configured.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/cnourrcier/mern-stack-backend.git
```

2. Install dependencies:

```bash
cd mern-stack-backend
npm install
```

3. Set up MongoDB:
- Install MongoDB locally or use a cloud-based MongoDB service like MongoDB Atlas.
- Update the MongoDB connection string in `index.js` to point to your MongoDB instance.

## Usage

1. Start the server:

```bash
npm run dev
```

2. Use tools like Postman, Hoppscotch.io, or Thunder Client to test the API endpoints (see [API Endpoints](#api-endpoints) section below).

## API Endpoints

### Todos
- **GET /api/todos/highest-priorities**: Retrieve 5 highest priority todos.
- **GET /api/todos**: Retrieve all todos.
- **GET /api/todos/:id**: Retrieve a todo by ID.
- **POST /api/todos**: Create a new todo.
- **PUT /api/todos/:id**: Update a todo.
- **DELETE /api/todos/:id**: Delete a todo by ID.

### Users
- **GET /api/users**: Retrieve all users.
- **GET /api/users/:id**: Retrieve a user by ID.
- **POST /api/todos/signup**: Create a new user.
- **POST /api/todos/login**: Login a registered user.
- **PUT /api/todos/:id**: Update a registered user.
- **DELETE /api/todos/:id**: Delete a user by ID.

## Logging

The application includes basic logging functionality using a combination of custom logging methods and external libraries. Every event and error that occurs in the application is logged to provide visibility into the system's behavior and aid in debugging, troubleshooting, and monitoring. The following information is logged: 

Request Log:
- Date and time of request
- API request method
- Origin request header
- API request URL

Error Log: 
- Date and time of error
- Error status code
- Error message

New Todo Log:
- Date and time of request
- Title of newly created todo
- Name of registered user who created the todo
 
## Next Steps

To further expand and enhance the functionality of this project, consider implementing the following features:

- Sanitation methods.
- User authentication and authorization.
- Optimizing database quieries for better performance.
- Implementing caching mechanisms to reduce database load.
- Writing unit tests.

## License

This project is licensed under the MIT License - see the [MIT License](LICENSE) file for details. 

