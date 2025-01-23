# User Service API

A RESTful API to manage users with JWT authentication and event handling. The API allows users to register, login, view all users, update user information, and delete users. It also includes Swagger documentation for easy exploration and Jest tests for API functionality.

## Features
- JWT-based authentication
- User CRUD operations
- Event-driven architecture
- Request validation
- Winston logging
- Swagger documentation
- Jest testing

## Installation
1. Clone repository:
```sh
 git clone ...
 cd user-service-api
```
2. Install dependencies:
```sh
npm install
```
3. Set up configuration:
```sh
cp .env.example .env
cp src/config/config.example.js src/config/config.js
cp src/config/passport.example.js src/config/passport.js
```

## Running the Application
Development:
```sh
npm run dev
```
Production:
```sh
npm start
```
## API Endpoints
| Method | Endpoint                | Description      |
|--------|-------------------------|------------------|
| POST   | `/api/v1/users/register` | Register user    |
| POST   | `/api/v1/users/login`    | Login user       |
| GET    | `/api/v1/users`          | Get users list   |
| GET    | `/api/v1/users/:id`      | Get user by ID   |
| PUT    | `/api/v1/users/:id`      | Update user      |
| DELETE | `/api/v1/users/:id`      | Delete user      |

## Event Handling
The application follows an event-driven architecture. Whenever a user is created relevant event is emitted and handled.

Event Types: Defined in src/events/eventTypes.js.
Event Emission: Events are emitted in controllers (e.g., USER_CREATED after user registration).
Event Listeners: Defined in src/listeners/userListener.js

## Logging (Winston)
Winston is used for logging in this project. In the development environment, logs will be printed to the console. 

## API Documentation (Swagger)
Swagger UI available at:
http://localhost:3000/api-docs

## Database Setup (SQLite)
The project uses SQLite as the database. By default, a test database with one user is created on the first run.

## Testing
Jest is used for unit and integration testing. Tests are located in the tests/ directory.

To run tests:
```sh
npm test
```
This will execute the tests using Jest and show the results in your terminal.
