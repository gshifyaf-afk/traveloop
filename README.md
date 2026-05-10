# Traveloop - Multi-City Travel Planner

Traveloop is a powerful tool for planning complex trips with multiple destinations. Manage your itinerary, budget, packing list, and notes all in one place.

## Features
- **Itinerary Builder:** Add stops and activities to your journey.
- **Budget Tracking:** Visualize expenses with interactive charts and spending alerts.
- **Sharing:** Generate a public link to share your trip with friends.
- **Packing Checklist:** Keep track of what you need to bring.
- **Trip Notes:** Jot down thoughts and memories for each trip.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla), EJS
- **Authentication:** express-session, bcrypt

## Getting Started

### Prerequisites
- Node.js installed on your system.

### Installation
1. Clone the repository (or copy the files).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (already provided in this generation):
   ```
   PORT=3000
   SESSION_SECRET=your_secret_here
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Git Workflow
1. **Branching:** Create a new branch for each feature (e.g., `git checkout -b feature/budget-chart`).
2. **Commits:** Write clear, descriptive commit messages.
3. **Pull Requests:** Submit PRs for review before merging into `main`.

## API Documentation
Visit `/api/docs` on your running server for a list of available endpoints.

## Offline Support
The app uses `localStorage` to cache trip data for basic offline viewing.
