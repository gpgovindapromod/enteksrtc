# Ente KSRTC - Frontend Client Reference Manual

## Overview
This document provides a comprehensive overview of the frontend architecture, technologies, and features of the **Ente KSRTC** web application. It is intended for project stakeholders, clients, and technical teams responsible for maintaining or extending the platform.

## Technology Stack
The frontend is built using a modern, scalable JavaScript stack:

- **Framework**: React 18
- **Build Tool**: Vite (for rapid development and optimized production builds)
- **Styling**: Tailwind CSS (utility-first CSS framework for custom, responsive designs)
- **State Management**: Zustand (lightweight, unopinionated state management)
- **Routing**: React Router DOM v7
- **Animations**: GSAP (GreenSock Animation Platform) for high-performance animations
- **Icons**: Lucide React
- **Network Requests**: Axios
- **Code Linting**: ESLint

## Architecture & State Management
The application is structured to handle both mobile and desktop experiences seamlessly, often employing specific components for each layout (e.g., `MobileBookingWidget` vs `DesktopSearchResults`) to ensure an optimal user experience across all devices.

### Global State (Zustand Stores)
The app state is divided into logical stores located in the `src/store/` directory:
- `useAppStore`: Manages UI states, theme preferences, language selection, and responsive layout flags.
- `useAuthStore`: Handles user authentication sessions, login modal visibility, and secure access.
- `useBookingStore`: Manages the complex state of bus searches, trip types, selected seats, passenger details, and active bookings.

### Theming
The application includes a built-in Dark/Light mode toggle (`ThemeContext`), ensuring accessibility and modern UI standards.

## Key Features
1. **Interactive Booking Engine**: Users can search for buses, specify origins and destinations, pick travel dates, and choose between one-way and round-trip journeys.
2. **Seat Selection**: Real-time interactive seat maps allowing users to pick specific seats.
3. **User Dashboard & Profiles**: A dedicated section for logged-in users to manage their profiles, view past tickets, and access active bookings.
4. **Live Tracking**: Mobile-optimized views for live tracking active journeys.
5. **Responsive Design**: Distinct layouts and navigational patterns for mobile (bottom tabs) and desktop (top navigation bars).

## Project Structure
```text
frontend/
├── public/               # Static assets (images, icons)
├── src/
│   ├── components/       # Reusable UI components (split by mobile/desktop/home)
│   ├── context/          # React Context providers (e.g., ThemeContext)
│   ├── data/             # Mock data and static configuration (translations, routes)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API integration logic (authService, etc.)
│   ├── store/            # Zustand state stores
│   ├── App.jsx           # Main application routing and layout
│   ├── index.css         # Tailwind directives and base styles
│   └── main.jsx          # React entry point
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind theme configuration
└── vite.config.js        # Vite build configuration
```

## Running the Project Locally

To run the frontend application in a local development environment:

1. **Prerequisites**: Ensure you have Node.js 18+ installed.
2. **Installation**:
   Navigate to the `frontend/` directory and install the dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. **Environment Variables**:
   Ensure the `.env` file exists in the `frontend/` directory with the necessary API base URL configuration.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Deployment
The project is configured for deployment using standard static hosting platforms (like Vercel, Netlify, or AWS S3).
To create a production build:
```bash
npm run build
```
This will generate optimized static files in the `dist/` directory, which can then be served by any web server.
