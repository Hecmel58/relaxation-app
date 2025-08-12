Relaxation Fullstack Package
============================
This package contains a minimal frontend (React + Vite) and backend (Express) demo wired to Supabase.

IMPORTANT:
- Replace placeholders in .env.example with your Supabase URL and ANON key.
- For production use, move authentication and password handling to a secure backend/service.

Quick start (local)
-------------------
1) Backend:
   cd backend
   npm install
   node index.js
   # backend listens on port 5000 by default
2) Frontend:
   cd frontend
   npm install
   npm run dev
   # open http://localhost:5173

Supabase
--------
- SQL file is in sql/create_tables.sql
- Example admin inserted using hash shown in the SQL file.
