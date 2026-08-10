# Ente KSRTC

MERN monorepo with a backend API and a React/Vite frontend.

## Prerequisites

- Node.js 18+
- MongoDB connection string for the backend

## Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the required values used by the server, such as `MONGO_URI` and `JWT_SECRET`.

Start the backend:

```bash
npm run dev
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on the Vite default port, usually `http://localhost:5173`.

## Project structure

- `backend/` - Express API server
- `frontend/` - React client app

