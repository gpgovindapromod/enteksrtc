# Ente KSRTC - MERN Monorepo

Welcome to the **Ente KSRTC** Bus Reservation System clone. This project is structured as an enterprise-level MERN (MongoDB, Express, React, Node.js) monorepo, demonstrating modern web development best practices, premium design aesthetics, and a robust "Universal-First" architecture.

## 🌟 Premium Features

- **High-End UI & Aesthetics**: Stunning user interface featuring glassmorphism (`.glass-panel`), custom glowing borders (`BorderGlow`), radial gradients, and dynamic hover states.
- **Micro-Interactions**: Smooth component animations including `GradualBlur` backgrounds, pulse effects, and animated element reveals (using standard CSS animations and transition utilities).
- **Mobile-First & Responsive Strategy**: Features entirely separate layout architectures for mobile and desktop (`MobileHomeTab`, `DesktopDashboard`) to provide an app-like experience on mobile and a rich, immersive dashboard on desktop.
- **Universal-First Architecture**: Core business logic (such as bus filtering, sorting, seat generation, and mock data) is centralized in shared services. This ensures identical behavior across platform-specific views without code duplication.
- **Global Theme Management**: Seamless Light/Dark mode switching managed globally via React Context, syncing dynamically with `localStorage`.
- **Accessibility (a11y)**: Fully keyboard navigable with custom emerald focus-rings (`*:focus-visible`) and descriptive `aria-label`s for screen readers.
- **Interactive Booking Flow**: Complete simulation of seat selection, total fare calculation, dynamic masonry galleries, and a seamless checkout process with boarding pass generation.

## 📁 Project Structure

- `/backend`: The Express.js API server, models, controllers, and routing.
- `/frontend`: The React (Vite) client application.
  - `src/components/desktop/`: Desktop-specific layout components.
  - `src/components/mobile/`: App-like mobile specific layout components.
  - `src/components/`: Reusable, premium UI components (`Masonry`, `BorderGlow`, `GradualBlur`).
  - `src/data/`: Centralized mock data and universal configurations.

## 🚀 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local or Atlas URI)

## 🛠️ Running the Project

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
npm install axios lucide-react
npm run dev
```

The frontend will usually be accessible at `http://localhost:5173`.

---

*Note: This project is for educational purposes only and is inspired by the Ente KSRTC platform.*
