Relaxation App (Fullstack)
==========================
This archive contains a minimal fullstack project (frontend + backend) prepared as a starting point for the web app you requested.
It aims to match the requested features and provide a working local setup so you can test web <-> mobile sync via API.

Structure
---------
/frontend   - Vite + React + TypeScript + Tailwind frontend
/backend    - Express backend (Node) with JWT auth, users, physiological-records, support-requests, and a WebSocket stub
/assets     - placeholder logo, media files

Quick start (both frontend and backend require Node >= 18)
---------------------------------------------------------
1) Backend:
   cd backend
   npm install
   # create .env file (see .env.example)
   npm run dev

2) Frontend:
   cd frontend
   npm install
   # create .env file (see .env.example) and set VITE_API_BASE_URL to backend URL, e.g. http://localhost:4000
   npm run dev

Notes
-----
- Backend implements JWT-based auth. Default test admin user:
  phone: +10000000000
  password: adminpass
- Frontend uses Tailwind for dark theme and responsive UI.
- Placeholder media and logo live in /assets. Replace them with your real assets.
- The frontend ApiService is configured to use VITE_API_BASE_URL environment variable.
- WebSocket signaling endpoint: ws://<backend-host>:4000
- For production you should enable HTTPS, strong CORS policy, rate limiting and a real database.
