# Todo Manager

This project constitutes a backend implementation of a RESTful API built upon MongoDB, Express.js, and Node.js. It offers comprehensive CRUD (Create, Read, Update, Delete) operations for efficient management of both todos and users. The system incorporates robust user authorization and authentication mechanisms, alongside convenient password reset functionality. Additionally, it features extensive event and error logging, complemented by global error handling capabilities.

Moreover, users benefit from advanced todo management functionalities, including the ability to sort, filter, and limit their todos based on various criteria such as priority level, creation date, and more. This ensures a streamlined and customizable experience tailored to individual user preferences.

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
- Dotenv: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.
- Bcrypt: A library for hashing passwords. 
- jsonwebtoken: A library used for secure authentication and data transmission between client and server.
- validator: A library of string validators and sanitizers.
- Nodemailer: A module for node.js to send emails.
- express-rate-limit: Middleware for Express used to limit repeated requests to public APIs and/or endpoints such as password reset.
- Helmet: Helps secure Expess apps by setting HTTP response headers.
- Express Mongoose Sanitize: Express 4.x middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
- hpp: Protect against HTTP parameter pollution attacks.

## Project Structure

The project follows a standard MVC (Model-View-Controller) pattern for organizing code:

- **controllers/**: Contains the logic for handling todo-related CRUD operations.
- **models/**: Contains the MongoDB schema definitions for todos.
- **routes/**: Contains the route definitions for todo API endpoints.
- **utils/**: Contains various utility classes and functions.
- **index.js**: The entry point of the application where the Express server is initialized and configured.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/cnourrcier/todo-manager.git
```

2. Install dependencies:

```bash
cd todo-manager
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

| Resource            | Method | Endpoint                     | Description                                        |
|---------------------|--------|------------------------------|----------------------------------------------------|
| Todos               | GET    | /api/todos                   | Retrieve all todos created by user.                |
|                     | GET    | /api/todos/:id               | Retrieve a todo by ID.                             |
|                     | POST   | /api/todos                   | Create a new todo.                                 |
|                     | PUT    | /api/todos/:id               | Update a todo.                                     |
|                     | DELETE | /api/todos/:id               | Delete a todo by ID.                               |
| Users               | GET    | /api/users                   | Retrieve all users (admin only route).             |
|                     | GET    | /api/users/:id               | Retrieve a user by ID (admin only route).          |
|                     | POST   | /api/users/signup            | Create an account.                                 |
|                     | POST   | /api/users/login             | Login a registered user.                           |
|                     | PUT    | /api/users/:id               | Update a registered user.                          |
|                     | DELETE | /api/users/:id               | Permanently delete a user by ID (admin only route).|
|                     | POST   | api/users/forgotPassword              | Generate and send email to user with link to reset password. |
|                     | PATCH  | api/users/resetPassword/:token        | User can use link from email to reset password.   |
|                     | PATCH  | api/users/updatePassword              | User can update password if desired.              |
|                     | PATCH  | api/users/updateMe                    | User can update name and email fields.            |
|                     | PATCH  | api/users/deleteMe                    | User can to soft delete (deactivate) account.     |

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
- ID of registered user who created the todo

## Contributing

If you'd like to contribute, please fork the repository and create a pull request. You can also open an issue to report bugs or suggest new features.

## License

This project is licensed under the MIT License - see the [MIT License](LICENSE) file for details. 

