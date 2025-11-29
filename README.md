# Incident Manager — Assignment Status

This repository contains a partial implementation of the interview assignment (backend + frontend). Below is a concise summary of what has been completed, what's still missing/buggy, how to run the project locally, and recommended next steps to finish the assignment.

---

## ✅ What I completed (evidence from repo)

Backend (Node, Express, Sequelize)

- Models present (Sequelize):
  - `User` — fields: user_id, name, email, passwordHash, role
  - `Project` — fields: project_id, project_name, location
  - `Incident` — fields: incident_id, title, description, severity, status, project_id, reported_by, reported_on
  - `IncidentAttachment` — fields: attachment_id, incident_id, file_url, comment, uploaded_at
  - Model relations are set in `Backend/src/models/index.js` (User <-> Incident, Project <-> Incident, Incident <-> IncidentAttachment).
- JWT auth implemented with bcrypt hashing:
  - `POST /api/auth/register` -> `Backend/src/routes/auth.js`
  - `POST /api/auth/login` -> `Backend/src/routes/auth.js`
  - `Backend/src/middleware/auth.js` enforces token checks.
- Incident management endpoints present in `Backend/src/routes/incident.js`:
  - `GET /api/incidents` — list incidents (filters supported via query params)
  - `GET /api/incidents/:id` — fetch single incident (includes attachments query in route)
  - `POST /api/incidents` — create incident (auth required)
  - `DELETE /api/incidents/:id` — delete incident (permission logic present)
- Project endpoints present in `Backend/src/routes/project.js`:
  - `POST /api/projects` — create project
  - `GET /api/projects/:id` — get project by ID
- File upload middleware exists (`Backend/src/middleware/upload.js`) and an attachments endpoint exists under incidents — the code expects uploads and attempts to store attachments.
- Simple DB is configured (SQLite) in `Backend/src/config/db.js` (the repo currently uses sqlite instead of PostgreSQL). This is useful for quick local testing.

Frontend (React + Axios)

- Basic login page exists at `frontend/src/Pages/LoginPage.js` and `frontend/src/api.js` contains API wrappers for login and incident calls.
- `frontend/src/Pages/IncidentCreatePage.js` exists but is incomplete.
- `frontend/src/App.js` and `frontend/src/Component/navbar.js` provide a minimal app shell.

---

## ⚠️ What is missing / known bugs

Back-end / API

- Upload/attachments route has issues:
  - The attachments route in `Backend/src/routes/incident.js` is inconsistent: it uses `upload.single('image')` but the handler expects `req.files` (multiple) and has a wrong `findByPk` argument (`incidentRoutes` variable used by mistake). This route will not work as-is.
- File size/type validation: `upload.js` exists but might allow all files by default; size/type limits should be enforced.
- Excel report generator endpoint (required `GET /projects/:id/report`) is not present - missing.

Front-end

- Incident creation form in `frontend/src/Pages/IncidentCreatePage.js` is incomplete (no upload & create logic).
- Incident list page and filtering UI are not implemented.
- Report download button is not implemented.

---

## 🧭 How to run this project locally

Note: the repo uses a local SQLite DB for quick testing. If you want PostgreSQL, you will need to change the DB config and install pg / pg-hstore.

1. Backend

Open a terminal and run:

```powershell
cd Backend
npm install
node index.js
```

- App default port is 4000; endpoints are exposed under `/api` (e.g., `http://localhost:4000/api/auth/login`).
- The SQLite database file is `Backend/database_sqlite`.

2. Frontend

Open a separate terminal and run:

```powershell
cd frontend
npm install
npm start
```

- The React dev server will run (by default on port 3000) and use the API at `http://localhost:4000/api`.

---

## 📌 APIs implemented (brief)

Authentication

- POST /api/auth/register -> register new user (bcrypt used)
- POST /api/auth/login -> returns JWT

Projects

- POST /api/projects -> create project (auth required)
- GET /api/projects/:id -> get project

Incidents

- GET /api/incidents -> list incidents, supports query params `project_id` and `severity`
- GET /api/incidents/:id -> get incident and attachments
- POST /api/incidents -> create incident (auth required)
- DELETE /api/incidents/:id -> delete incident (permission logic present but should be reviewed)
- POST /api/incidents/:id/attachment -> endpoint exists but contains implementation bugs and will not work correctly until fixed
