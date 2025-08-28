# Online Judge Platform - A Full-Stack Coding Environment

This repository contains the source code for a modern, full-stack Online Judge platform designed for competitive programming practice. It leverages a microservices architecture to create a robust, scalable, and feature-rich environment for coders.

---

### **Live:** [**https://www.swyamsharma.me/**](https://www.swyamsharma.me/) (Currently stopped the instance to save costs)

---

## Table of Contents

- [Features](#features)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)

## Features

### User Features

*   **Authentication**: Secure user registration and login with both email/password and Google OAuth 2.0. Includes password reset functionality.
*   **Problem-Solving Environment**:
    *   **Problem Library**: Browse a list of coding problems, filterable by difficulty, status (Solved, Attempted, To-Do), and tags.
    *   **In-Browser IDE**: A powerful Monaco-based code editor supporting C++ and JavaScript. Code is auto-saved locally to prevent progress loss.
    *   **Code Execution**: Run code against sample test cases or custom user input for quick validation.
    *   **Secure Submission**: Submit solutions for evaluation against a comprehensive set of hidden test cases.
*   **AI-Powered Assistance**:
    *   **Smart Hints**: For failed submissions (Wrong Answer, Time Limit Exceeded), users can request an AI-generated hint that guides them toward the correct logic without giving away the solution.
    *   **Code Analysis**: On successful submissions, users can get an AI-powered analysis of their code, including Time and Space Complexity and suggestions for optimization.
*   **Personalized Dashboard**:
    *   **Statistics**: View key metrics like problems solved, acceptance rate, and maximum daily streak.
    *   **Activity Calendar**: A GitHub-style contribution graph visualizing submission activity over the past year.
    *   **Difficulty Breakdown**: Track progress across Easy, Medium, and Hard problems.
    *   **Recent Activity**: A list of recently solved problems for quick access.
*   **Profile Management**: Users can update their personal information and change their password.

### Admin Features

*   **CRUD for Problems**: A dedicated interface for administrators to create, read, update, and delete problems.
*   **AI Test Case Generation**: Admins can provide a reference solution to an AI service, which automatically generates a suite of diverse and verified test cases.
*   **User Management**: View all registered users, manage their roles (promote to admin), and delete users if necessary.
*   **Submission Monitoring**: A centralized view to browse, filter, and inspect all user submissions across the platform.

## Architecture Overview

The platform is built on a microservices architecture to ensure separation of concerns, scalability, and maintainability.

*   `client`: A **React (Vite)** single-page application that provides the user interface. It communicates with the main server via a REST API.
*   `server`: The main **Node.js/Express** backend. It handles authentication, user data, problem management, and serves as the primary API gateway. It offloads intensive tasks to other services.
*   `evaluation-service`: A dedicated **Node.js** worker responsible for executing user-submitted code. It listens for jobs from a **RabbitMQ** queue, runs the code in isolated **Docker containers**, and evaluates the output against test cases.
*   `ai-service`: A **Node.js/Express** microservice that acts as a proxy to the **Groq AI** API. It handles prompting for generating hints, code analysis, and test cases.
*   **RabbitMQ**: A message broker that decouples the `server` from the `evaluation-service`. The server queues a submission job, and the evaluation service consumes it, allowing the API to remain responsive.
*   **MongoDB**: The primary database used by all services to store user, problem, and submission data.
*   **AWS S3**: Used for persistent storage of user code files and hidden test case files, keeping the database light.
*   **Docker Compose**: Orchestrates all the services, making it easy to set up and run the entire stack locally with a single command.

## Tech Stack

| Service                | Technologies & Libraries                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Frontend (Client)**  | `React`, `Redux Toolkit`, `Vite`, `React Router`, `Tailwind CSS`, `Monaco Editor`, `Axios`, `Socket.IO Client`, `Chart.js` |
| **Backend (Server)**   | `Node.js`, `Express.js`, `Mongoose`, `JWT`, `Passport.js (Google OAuth)`, `Socket.IO`, `Nodemailer`, `bcryptjs`, `amqplib`     |
| **Evaluation Service** | `Node.js`, `Express.js`, `Dockerode`, `amqplib`, `@aws-sdk/client-s3`                                                     |
| **AI Service**         | `Node.js`, `Express.js`, `OpenAI SDK (for Groq)`, `Axios`                                                                  |
| **Database**           | `MongoDB`                                                                                                               |
| **Infrastructure**     | `Docker`, `Docker Compose`, `RabbitMQ`, `AWS S3`                                                                          |
| **AI Provider**        | `Groq` (using the Llama 3 model)                                                                                           |

## Local Development Setup

### Prerequisites

*   **Docker** and **Docker Compose**: Ensure they are installed and the Docker daemon is running.

### Environment Variables

1.  Create a `.env` file in the root directory (`swyamsharma-onlinejudge/`).
2.  Populate it with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://mongodb:27017/onlinejudge

# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672
RESULT_EXCHANGE=results_exchange

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Nodemailer for Password Reset
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
EMAIL_FROM=your_from_email@example.com

# AI Service (Groq)
GROQ_API_KEY=your_groq_api_key

# AWS S3 for File Storage
AWS_REGION=your_aws_s3_bucket_region
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_s3_bucket_name

# Service URLs
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://ai-service:5002
EVALUATION_SERVICE_URL=http://evaluation-service:5001/run

# Ports (can be changed in docker-compose.yml as well)
PORT=5000
AI_PORT=5002
EVAL_PORT=5001
```

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/swyamsharma-onlinejudge.git
    cd swyamsharma-onlinejudge
    ```

2.  **Start the services:**
    Use Docker Compose to build the images and start all the containers.
    ```bash
    docker-compose up --build
    ```

3.  **Access the application:**
    *   **Frontend**: `http://localhost:5173`
    *   **Backend Server API**: `http://localhost:5000`
    *   **RabbitMQ Management**: `http://localhost:15672`

## Project Structure

```
└── swyamsharma-onlinejudge/
    ├── docker-compose.yml
    ├── ai-service/             # Handles AI/LLM interactions
    ├── client/                 # React frontend
    ├── evaluation-service/     # Runs code in isolated Docker containers
    └── server/                 # Main backend API server
```
