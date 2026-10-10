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

# Payment Configuration (SIMULATED or RAZORPAY)
PAYMENT_PROVIDER=SIMULATED
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_test_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PAYMENT_WEBHOOK_SECRET=sim-webhook-secret

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

## Payment Integration (Razorpay)

The application supports both a `SIMULATED` mode and a real `RAZORPAY` test mode for processing payments.

- **SIMULATED**: Default mode. Does not require internet or credentials. Automatically approves payments for easy local testing.
- **RAZORPAY**: To activate, set `PAYMENT_PROVIDER=RAZORPAY` in your `backend/.env` file and provide `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Use Razorpay **TEST MODE** credentials only. Never expose the `KEY_SECRET` to the frontend.

A webhook route is available at `POST /api/bookings/webhook`. Configure it in the Razorpay Dashboard to listen to `payment.captured`, `payment.failed`, and `order.paid` events.

## Roles & Dashboards

The platform implements robust Role-Based Access Control (RBAC) and tailored dashboards for various user types:

- **Passenger**: The default role. Can search routes, view seating layouts, book tickets, process payments, and cancel bookings.
- **Admin**: Has global access to all users, depots, buses, and financial analytics. Can generate advanced charts and view real-time system logs.
- **Station Master**: Securely scoped to their assigned depot. Can manage local staff (drivers and conductors), update local fleet status (active/maintenance), assign conductors to trips, and monitor trip lifecycles (Scheduled -> Open -> Boarding -> Departed -> Completed). Can view real-time passenger manifests for their depot's trips.
- **Conductor / Driver**: (To be fully implemented) Scoped access to view their assigned upcoming trips and manifests.
