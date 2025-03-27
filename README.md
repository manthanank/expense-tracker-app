# Expense Tracker App

This is a full-stack expense tracker application built with Node.js for the backend and Angular for the frontend. It allows users to sign up, log in, add, edit, delete, and filter expenses by date and category. The app includes AI-powered insights using Google's Gemini API.

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
- Responsive landing page
- Add, edit, delete, and view expenses
- Filter expenses by date range and category
- Total expenses calculation for different time periods (past week, last month, last 3 months, last 6 months, custom date range)
- AI-powered expense analysis and personalized financial insights using Google Gemini API
- Smart spending recommendations and budget health assessment
- Expense visualization with charts and graphs
- Forgot and reset password functionality
- Visitor count tracking
- Privacy policy and terms of service pages
- Responsive design using Tailwind CSS

## Technologies Used

### Backend Technologies

- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- Nodemailer for email functionality
- Google Generative AI (Gemini) for financial insights
- Swagger for API documentation
- Express Rate Limiter & Helmet for security

### Frontend Technologies

- Angular 19
- Tailwind CSS for styling
- NGX Charts for data visualization
- Font Awesome icons
- Responsive design

## Prerequisites

- Node.js (v14.x or later)
- Angular CLI (v19.x or later)
- MongoDB (local or remote instance)
- Google Gemini API key

## Installation

### Backend Setup

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
    TOKEN_SECRET=your_jwt_secret
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-email-password
    GEMINI_API_KEY=your_gemini_api_key
    ```

4. Start the backend server:

    ```sh
    npm start

### Frontend Setup

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
- API documentation is available at `http://localhost:5000/api-docs`.

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

### Insights

- **GET /api/insights/ai**: Get AI-generated insights for expenses with optional filters
  - Query Parameters:
    - `startDate`: Filter expenses from this date
    - `endDate`: Filter expenses until this date
    - `category`: Filter by expense category

## Usage

1. **Sign Up**: Create a new account by navigating to the sign-up page.
2. **Log In**: Log in with your credentials to access the expense tracker.
3. **Forgot Password**: If you forget your password, use the forgot password link to reset it.
4. **Reset Password**: Follow the instructions in the reset password email to set a new password.
5. **Add Expense**: Use the form to add a new expense with amount, category, date, and description.
6. **View Expenses**: View a list of all your expenses. Use the filter options to filter by date range and category.
7. **Edit Expense**: Click on an expense to edit its details.
8. **Delete Expense**: Click the delete button to remove an expense.
9. **Get AI Insights**: Navigate to the insights section to get AI-powered analysis of your spending habits, including top spending categories, trends, anomalies, and personalized saving suggestions.
10. **View Charts**: Explore visual representations of your spending patterns.

## Deployment

The application is deployed on Vercel at: [https://expense-tracker-app-manthanank.vercel.app/](https://expense-tracker-app-manthanank.vercel.app/)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please contact:

- Email: [manthan.ank@gmail.com](mailto:manthan.ank@gmail.com)
- GitHub: [manthanank](https://github.com/manthanank)
