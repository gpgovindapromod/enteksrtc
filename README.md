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

Create a `.env` file in `backend/` with the required values used by the server:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=5011

# Twilio Configuration for OTP
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>

# Optional (comma-separated list)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

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
You can set `VITE_API_BASE_URL` in `frontend/.env` if your API is hosted on a different URL.

## Project structure

- `backend/` - Express API server
- `frontend/` - React client app
