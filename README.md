# Expense Tracker App

This is a full-stack expense tracker application built with Node.js for the backend and Angular for the frontend. It allows users to sign up, log in, add, edit, delete, and filter expenses by date and category.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

## Features

- User authentication with JWT
- Landing page
- Add, edit, delete, and view expenses
- Filter expenses by date range and category
- Total expenses calculation for the all-time and filtered expenses like this past week, last month, last 3 months, last 6 months and custom date range.
- Forgot and reset password functionality
- Responsive design using Tailwind CSS

## Technologies Used

- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer
- Frontend: Angular, Tailwind CSS
- Authentication: JSON Web Tokens (JWT)

## Prerequisites

- Node.js (v14.x or later)
- Angular CLI (v19.x or later)
- MongoDB (local or remote instance)

## Installation

### Backend

1. Clone the repository:

    ```sh
    git clone https://github.com/manthanank/expense-tracker-app.git
    cd expense-tracker-app/backend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the `backend` directory with the following content:

    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-email-password
    ```

4. Start the backend server:

    ```sh
    npm start
    ```

### Frontend

1. Navigate to the frontend directory:

    ```sh
    cd expense-tracker-app
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Start the frontend server:

    ```sh
    ng serve
    ```

## Running the Application

- The backend server will run on `http://localhost:5000`.
- The frontend server will run on `http://localhost:4200`.

## API Endpoints

### Auth

- **POST /api/auth/signup**: Create a new user
- **POST /api/auth/login**: Authenticate a user and get a token
- **POST /api/auth/forgot-password**: Send password reset email
- **POST /api/auth/reset-password/:token**: Reset user password

### Expenses

- **GET /api/expenses**: Get all expenses for the logged-in user
- **GET /api/expenses/:id**: Get an expense by ID
- **POST /api/expenses**: Add a new expense
- **PUT /api/expenses/:id**: Update an existing expense
- **DELETE /api/expenses/:id**: Delete an expense

## Usage

1. **Sign Up**: Create a new account by navigating to the sign-up page.
2. **Log In**: Log in with your credentials to access the expense tracker.
3. **Forgot Password**: If you forget your password, use the forgot password link to reset it.
4. **Reset Password**: Follow the instructions in the reset password email to set a new password.
5. **Add Expense**: Use the form to add a new expense.
6. **View Expenses**: View a list of all your expenses. Use the filter options to filter by date range and category.
7. **Edit Expense**: Click on an expense to edit its details.
8. **Delete Expense**: Click the delete button to remove an expense.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
