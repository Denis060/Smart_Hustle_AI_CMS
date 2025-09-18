# Smart Hustle with AI - Monorepo

## Project Structure

- `frontend/` — Vite + React + Tailwind CSS (public site & admin dashboard)
- `backend/` — Node.js + Express + Sequelize + MySQL (API & CMS logic)

---

## How to Run (Sequential Workflow)

### 1. Start the Backend
```powershell
cd backend
node index.js
```
- The backend API will run on `http://localhost:5000` by default.

### 2. Start the Frontend
```powershell
cd frontend
npm run dev
```
- The frontend will run on `http://localhost:5173` by default.

---

## Useful Scripts
- **Migrate DB:**
  ```powershell
  cd backend
  npx sequelize-cli db:migrate
  ```
- **Create Admin User:**
  Use `/api/auth/register` endpoint (POST) with JSON body `{ "username": "admin", "email": "admin@example.com", "password": "yourpassword" }`

---

## Notes
- Always run commands from the correct directory (`frontend` or `backend`).
- Update `.env` in `backend/` for your DB and JWT secrets.
- See the PDF brief for full requirements and features.

---

## Next Steps
- Build out API endpoints and connect frontend to backend.
- Implement admin dashboard and public site features.
- Style with Tailwind CSS as per the prototypes.

---

For any issues, check the terminal output for errors and ensure you are in the correct directory.
