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

# Firebase Admin configuration for phone authentication.
# Keep the service-account JSON on one line, or use base64 to avoid multiline
# .env parsing issues.
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"..."}
# Alternative:
# FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=<base64-encoded-service-account-json>

# Optional (comma-separated list)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The signup flow sends and verifies the six-digit OTP with Firebase Phone
Authentication. Enable Phone sign-in in Firebase Console and add the local
development domain to Firebase Authentication's authorized domains.

To fix `Firebase: Error (auth/operation-not-allowed)`:

1. Open **Firebase Console** and select project `enteksrtc-a3a9a`.
2. Go to **Build > Authentication > Sign-in method**.
3. Select **Phone**, enable it, and save.
4. In **Authentication > Settings > Authorized domains**, add `localhost`
   and the domain hosting the frontend.
5. Restart the Vite frontend after changing `.env` values.

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
Add the Firebase Web App configuration to `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=<firebase-web-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<firebase-project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<firebase-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<firebase-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<firebase-sender-id>
VITE_FIREBASE_APP_ID=<firebase-app-id>
```

## Project structure

- `backend/` - Express API server (Uses `jsonwebtoken` for authentication)
- `frontend/` - React client app (Uses `react-router-dom` for navigation)
