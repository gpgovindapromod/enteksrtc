# Ente KSRTC - MERN Monorepo

Welcome to the **Ente KSRTC** Bus Reservation System clone. This project is structured as an enterprise-level MERN (MongoDB, Express, React, Node.js) monorepo.

## Project Structure

- `/backend`: The Express.js API server, models, controllers, and services.
- `/frontend`: The React (Vite) client application.

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local or Atlas URI)

## Running the Project

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and start the development server.

```bash
cd backend
npm install
npm run dev
```
*(Ensure your `.env` file is properly configured with `MONGO_URI`, `JWT_SECRET`, etc. before starting.)*

### 2. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the Vite development server.

```bash
cd frontend
npm install
npm run dev
```

The frontend will usually be accessible at `http://localhost:5173`.

---

*Note: This project is for educational purposes only and is inspired by the Ente KSRTC platform.*
