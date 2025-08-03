# Feedback Backend API

This backend provides APIs for managing sessions, questions, feedback, authentication, and analytics using Node.js, Express, and Prisma.

## Table of Contents
- [Auth Routes](#auth-routes)
- [Session Routes](#session-routes)
- [Question Routes](#question-routes)
- [Feedback Routes](#feedback-routes)
- [Analytics Routes](#analytics-routes)
- [How It Works](#how-it-works)

---

## Auth Routes (`/api/auth`)

**POST `/register-admin`**
  - Registers a new admin.
  - Body:
    ```json
    {
      "name": "Test Admin",
      "email": "admin@example.com",
      "password": "password123",
      "mobileNumber": "1234567890",
      "bio": "Test admin bio"
    }
    ```
  - Example fetch:
    ```js
    fetch('/api/auth/register-admin', {

# Feedback System API Reference

This document provides a detailed reference for all backend API routes, including endpoint, method, request body, required headers, and example responses.

---

## Authentication

### Register Admin
- **POST** `/api/auth/register-admin`
- **Body:**
  ```json
  {
    "name": "Test Admin",
    "email": "admin@example.com",
    "password": "password123",
    "mobileNumber": "1234567890",
    "bio": "Test admin bio"
  }
  ```
- **Headers:** `{ "Content-Type": "application/json" }`
- **Response:**
  ```json
  {
    "message": "Admin registered successfully",
    "token": "<jwt_token>",
    "admin": {
      "id": "...",
      "name": "Test Admin",
      "email": "admin@example.com",
      "bio": "Test admin bio",
      "mobileNumber": "1234567890"
    }
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  { "email": "admin@example.com", "password": "password123" }
  ```
- **Headers:** `{ "Content-Type": "application/json" }`
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "<jwt_token>",
    "admin": {
      "id": "...",
      "name": "Test Admin",
      "email": "admin@example.com",
      "bio": "Test admin bio",
      "mobileNumber": "1234567890"
    }
  }
  ```

### Change Password
- **PUT** `/api/auth/change-password`
- **Body:**
  ```json
  { "oldPassword": "password123", "newPassword": "newpass456" }
  ```
- **Headers:** `{ "Content-Type": "application/json", "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  { "message": "Password changed successfully" }
  ```

---

## Sessions

### Create Session
- **POST** `/api/sessions`
- **Body:**
  ```json
  { "title": "Test Session", "description": "A session for testing", "date": "2025-08-01T10:00:00.000Z" }
  ```
- **Headers:** `{ "Content-Type": "application/json", "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  {
    "message": "Session created successfully",
    "session": {
      "id": "...",
      "title": "Test Session",
      "description": "A session for testing",
      "date": "2025-08-01T10:00:00.000Z",
      "adminId": "..."
    }
  }
  ```

### Get All Sessions
- **GET** `/api/sessions`
- **Headers:** `{ "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  [
    {
      "id": "...",
      "title": "Test Session",
      "description": "A session for testing",
      "date": "2025-08-01T10:00:00.000Z",
      "admin": { "id": "...", "name": "Test Admin", "email": "admin@example.com" },
      "_count": { "questions": 3, "responses": 2 }
    }
  ]
  ```
   
### Get Session by ID
- **GET** `/api/sessions/{sessionId}`
- **Headers:** `{ "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  {
    "id": "...",
    "title": "Test Session",
    "description": "A session for testing",
    "date": "2025-08-01T10:00:00.000Z",
    "admin": { "id": "...", "name": "Test Admin", "email": "admin@example.com" },
    "questions": [
      { "id": "...", "text": "What is your name?", "type": "TEXT", "isRequired": true, "sessionId": "..." }
    ],
    "responses": [
      {
        "id": "...",
        "sessionId": "...",
        "answers": [
          { "id": "...", "questionId": "...", "responseText": "John Doe", "selectedOption": null, "rating": null, "question": { "id": "...", "text": "What is your name?", "type": "TEXT" } }
        ]
      }
    ]
  }
  ```

---

## Questions

### Add Questions
- **POST** `/api/questions/{sessionId}`
- **Body:**
  ```json
  { "questions": [ { "text": "What is your name?", "type": "TEXT", "isRequired": true } ] }
  ```
- **Headers:** `{ "Content-Type": "application/json", "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  {
    "message": "Questions added successfully",
    "questions": [
      { "id": "...", "text": "What is your name?", "type": "TEXT", "isRequired": true, "sessionId": "..." }
    ]
  }
  ```

### Delete Question
- **DELETE** `/api/questions/{questionId}`
- **Headers:** `{ "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  { "message": "Question removed successfully" }
  ```

### Get Session Questions
- **GET** `/api/questions/{sessionId}`
- **Response:**
  ```json
  [
    { "id": "...", "text": "What is your name?", "type": "TEXT", "isRequired": true, "sessionId": "...", "options": null },
    { "id": "...", "text": "Did you like the session?", "type": "YES_NO", "isRequired": true, "sessionId": "...", "options": ["Yes", "No"] },
    { "id": "...", "text": "Rate the session", "type": "RATING", "isRequired": false, "sessionId": "...", "options": [1,2,3,4,5] }
  ]
  ```

---

## Feedback

### Submit Feedback
- **POST** `/api/feedback/{sessionId}`
- **Body:**
  ```json
  { "answers": [ { "questionId": "...", "value": "John Doe" } ] }
  ```
- **Headers:** `{ "Content-Type": "application/json" }`
- **Response:**
  ```json
  { "message": "Feedback submitted successfully", "feedbackResponseId": "..." }
  ```

### Get All Feedbacks for a Session
- **GET** `/api/feedback/{sessionId}`
- **Headers:** `{ "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  [
    {
      "id": "...",
      "sessionId": "...",
      "answers": [
        { "id": "...", "questionId": "...", "responseText": "John Doe", "selectedOption": null, "rating": null, "question": { "id": "...", "text": "What is your name?", "type": "TEXT" } }
      ]
    }
  ]
  ```

---

## Analytics

### Get Session Analytics
- **GET** `/api/analytics/sessions/{sessionId}`
- **Headers:** `{ "Authorization": "Bearer <token>" }`
- **Response:**
  ```json
  {
    "sessionId": "...",
    "sessionTitle": "Test Session",
    "totalFeedbackResponses": 2,
    "questionAnalytics": [
      {
        "questionId": "...",
        "questionText": "Did you like the session?",
        "questionType": "YES_NO",
        "totalAnswers": 2,
        "details": { "yes": 1, "no": 1, "unanswered": 0 }
      },
      {
        "questionId": "...",
        "questionText": "Rate the session",
        "questionType": "RATING",
        "totalAnswers": 2,
        "details": { "average": "4.50", "min": 4, "max": 5, "count": 2 }
      },
      {
        "questionId": "...",
        "questionText": "What is your name?",
        "questionType": "TEXT",
        "totalAnswers": 2,
        "details": { "count": 2, "sampleResponses": ["John Doe", "Jane Smith"] }
      }
    ]
  }
  ```

---

## Notes
- All admin-protected routes require a valid JWT token in the `Authorization` header.
- All request/response dates are in ISO format.
- Error responses follow the format: `{ "message": "Error message" }` with appropriate HTTP status codes.
- Question types: `TEXT` (string), `YES_NO` (boolean), `RATING` (integer 1-5).

---

**GET `/:sessionId`**
  - Gets all questions for a session (public).
  - Example fetch:
    ```js
    fetch('/api/questions/<sessionId>')
    ```
  - Example response:
    ```json
    [
      { "id": "...", "text": "What is your name?", "type": "TEXT", "isRequired": true, "sessionId": "...", "options": null },
      { "id": "...", "text": "Did you like the session?", "type": "YES_NO", "isRequired": true, "sessionId": "...", "options": ["Yes", "No"] },
      { "id": "...", "text": "Rate the session", "type": "RATING", "isRequired": false, "sessionId": "...", "options": [1,2,3,4,5] }
    ]
    ```

---

## Feedback Routes (`/api/feedback`)

**POST `/:sessionId`**
  - Submits feedback for a session (**public**; anyone can submit feedback).
  - Body:
    ```json
    { "answers": [ { "questionId": "...", "value": "John Doe" } ] }
    ```
  - Example fetch:
    ```js
    fetch('/api/feedback/<sessionId>', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: [ { questionId: '...', value: 'John Doe' } ] })
    })
    ```
  - Example response:
    ```json
    { "message": "Feedback submitted successfully", "feedbackResponseId": "..." }
    ```

**GET `/:sessionId`**
  - Gets all feedbacks for a session (**admin only**; requires JWT token).
  - Headers: `{ Authorization: 'Bearer <token>' }`
  - Example fetch:
    ```js
    fetch('/api/feedback/<sessionId>', {
      headers: { Authorization: 'Bearer <token>' }
    })
    ```
  - Example response:
    ```json
    [
      {
        "id": "...",
        "sessionId": "...",
        "answers": [
          { "id": "...", "questionId": "...", "responseText": "John Doe", "selectedOption": null, "rating": null, "question": { "id": "...", "text": "What is your name?", "type": "TEXT" } }
        ]
      }
    ]
    ```

---

## Analytics Routes (`/api/analytics`)

**GET `/sessions/:sessionId`**
  - Gets analytics for a session (admin only).
  - Headers: `{ Authorization: 'Bearer <token>' }`
  - Example fetch:
    ```js
    fetch('/api/analytics/sessions/<sessionId>', {
      headers: { Authorization: 'Bearer <token>' }
    })
    ```
  - Example response:
    ```json
    {
      "sessionId": "...",
      "sessionTitle": "Test Session",
      "totalFeedbackResponses": 2,
      "questionAnalytics": [
        {
          "questionId": "...",
          "questionText": "Did you like the session?",
          "questionType": "YES_NO",
          "totalAnswers": 2,
          "details": { "yes": 1, "no": 1, "unanswered": 0 }
        },
        {
          "questionId": "...",
          "questionText": "Rate the session",
          "questionType": "RATING",
          "totalAnswers": 2,
          "details": { "average": "4.50", "min": 4, "max": 5, "count": 2 }
        },
        {
          "questionId": "...",
          "questionText": "What is your name?",
          "questionType": "TEXT",
          "totalAnswers": 2,
          "details": { "count": 2, "sampleResponses": ["John Doe", "Jane Smith"] }
        }
      ]
    }
    ```

---

## How It Works
- All routes use Express and Prisma for database access.
- Admin-protected routes require a JWT token in the `Authorization` header.
- Data is validated before being saved or returned.
- Analytics and feedback routes aggregate and return structured data for easy frontend use.

---

For more details or example requests/responses for any route, see the code or contact the maintainer.
