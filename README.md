# Florera API Backend

This is the backend service for the Florera application. It provides the REST API for the Florera main application, Admin Seller, Admin Mentor, and Admin All-in-One dashboards. The backend is built using Node.js and Express.js, connecting to a MongoDB database.

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB
*   **ODM:** Mongoose
*   **Authentication:** JSON Web Token (JWT), bcrypt
*   **Media Storage:** Cloudinary, Multer
*   **Payment Gateway:** Midtrans Client
*   **Email Services:** Nodemailer, SendGrid
*   **Messaging:** WhatsApp Web JS
*   **Validation:** Validator

## Core Features

*   **Role-Based Access Control:** Separate API routes and authentication layers for Admin, User, Seller, and Mentor.
*   **Authentication and Authorization:** Secure login and registration using JWT, with OTP verification for account activation.
*   **Product and Course Management:** Endpoints to handle CRUD operations for products (sellers) and courses (mentors) with image uploads via Cloudinary.
*   **Cart and Checkout:** Shopping cart functionality and payment processing integrated with Midtrans.
*   **Automated Cleanup Tasks:** Background process that runs every minute to remove unverified accounts with expired OTPs.
*   **CORS Configuration:** Dynamic Cross-Origin Resource Sharing settings supporting multiple frontend environments.

## Getting Started

Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   MongoDB Cluster/Local instance
*   Cloudinary Account
*   Midtrans Account
*   SendGrid Account (optional, for email delivery)

### Installation

1.  Clone the repository and navigate to the backend directory.
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Create a copy of `.env.example` and rename it to `.env`.
4.  Fill in the environment variables in `.env` with your actual credentials:
    ```bash
    cp .env.example .env
    ```

### Running the Application

To start the server in development mode using nodemon (auto-reloads on changes):

```bash
npm run server
```

To start the server in production mode:

```bash
npm start
```

The server will start on the port specified in your `.env` file (default is 4000).

## Project Structure

*   `config/`: Configuration files for database connections (MongoDB, Cloudinary).
*   `controllers/`: Request handlers containing the business logic for each route.
*   `middleware/`: Custom Express middlewares for authentication, authorization, and file uploads.
*   `models/`: Mongoose schema definitions for the database collections.
*   `routes/`: API endpoint definitions mapped to their respective controllers.
*   `templates/`: Contains templates used within the application (e.g., email templates).
*   `server.js`: The main entry point of the application.

## API Documentation

For API testing, a Postman collection (`postman_collection.json`) is available in the root of this directory. It contains all the endpoints for the Admin, User, Seller, Mentor, Product, Course, Category, Cart, and Payment routes. Import it directly into your Postman application.