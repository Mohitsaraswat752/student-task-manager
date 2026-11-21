# Student Task Manager

A full-stack task management application designed to help students organize study goals, track deadlines, and focus on priorities. The app provides a React interface backed by a REST API built with Express and MongoDB.

## Features

- Create an account and sign in with email and password
- JWT-based authentication for protected task operations
- Create, complete, and delete personal tasks
- Assign High, Medium, or Low priority to each task
- Add optional due dates and identify overdue tasks
- Search tasks by title and filter by completion status or priority
- Sort tasks by newest, due date, or priority
- View task totals for completed, pending, and overdue work

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS  
**Backend:** Node.js, Express 5, MongoDB, Mongoose  
**Authentication:** JSON Web Tokens, bcryptjs

## Project Structure

```text
.
├── client/                 # React and Vite frontend
│   └── src/
└── server/                 # Express API and MongoDB models
    ├── middleware/         # JWT authentication middleware
    ├── models/             # User and Task schemas
    └── server.js           # API routes and server entry point
```

## Prerequisites

- Node.js (a current LTS release is recommended)
- npm
- MongoDB database, either local or hosted (for example, MongoDB Atlas)

## Getting Started

### 1. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

`MONGO_URI` must point to a reachable MongoDB database. Set a unique, private `JWT_SECRET` for your environment.

### 2. Configure the frontend

In a second terminal:

```bash
cd client
npm install
```

The frontend currently sends API requests to `http://localhost:5000`. Start the backend on that address and port when running the app locally.

### 3. Run the application

Start the API from `server/`:

```bash
npm run dev
```

Start the frontend from `client/` in another terminal:

```bash
npm run dev
```

Vite prints the local frontend URL in the terminal (typically `http://localhost:5173`). Open it in your browser, register an account, and start adding tasks.

For a production frontend build, run from `client/`:

```bash
npm run build
```

## API Overview

The API runs on `http://localhost:5000` by default. Protected task endpoints expect a JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register with name, email, and password |
| `POST` | `/auth/login` | No | Sign in and receive a JWT |
| `GET` | `/tasks` | Yes | List the signed-in user's tasks |
| `POST` | `/tasks` | Yes | Create a task |
| `PUT` | `/tasks/:id` | Yes | Update task fields or completion state |
| `DELETE` | `/tasks/:id` | Yes | Delete a task |
| `GET` | `/` | No | Check that the API is running |

`GET /tasks` supports these query parameters: `search` (title substring), `status` (`pending` or `completed`), `priority` (`High`, `Medium`, or `Low`), and `sortBy` (`dueDate`). The frontend also supports priority sorting locally.

### Example task payload

```json
{
  "title": "Review calculus notes",
  "priority": "High",
  "dueDate": "2026-12-01"
}
```

A new task defaults to `Medium` priority when no valid priority is supplied. Due dates are optional.

## Available Scripts

### `server/`

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Node.js watch mode |
| `npm start` | Start the API |

### `client/`

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Data and Security Notes

- Each task is associated with its owner; task queries and changes are scoped to the authenticated user.
- Passwords are hashed with bcryptjs before storage.
- JWT signing uses `JWT_SECRET`; configure a strong secret before deployment.
- Keep `.env` files and database credentials private. Do not commit real secrets to version control.

## License

No project license has been specified yet.
