# AlgoGurukul

Full-stack application for managing coding problems, user submissions, and admin workflows.

- **Frontend:** React + Vite
- **Backend:** Node/Express + MongoDB + Redis

---

## Features

- User authentication (login/register/logout)
- Admin authentication & admin operations
- Problem CRUD (create/update/delete)
- Submit code + run code (Judge0)
- AI chat features (Gemini)
- Video upload/management (Cloudinary)

---

## Tech Stack

- **Frontend:** React (Redux Toolkit, React Router, Tailwind/DaisyUI)
- **Backend:** Express, Mongoose (MongoDB), Redis, JWT (cookies)
- **Execution engine:** Judge0
- **AI:** Google Gemini API
- **Assets:** Cloudinary

---

## Prerequisites

- Node.js (LTS recommended)
- MongoDB Atlas (or MongoDB instance)
- Redis (with password / credentials)
- Judge0 account / credentials (or public endpoint)
- Cloudinary account
- Gemini API key

---

## Environment Variables

### Backend
Create a `.env` file in `AlgoGurukul/Backend/`:

```bash
PORT=4000
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
REDIS_PASS=your_redis_password

JUDGE0_SERVER=your_judge0_host
JUDGE0_PORT=your_judge0_port
JUDGE0_KEY=your_judge0_key

GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=your_frontend_url

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> Note: The backend `redis.js` currently uses a fixed Redis host. Update `AlgoGurukul/Backend/src/config/redis.js` if your Redis host differs.

### Frontend
Create a `.env` file in `AlgoGurukul/Frontend/`:

```bash
VITE_API_URL=http://localhost:4000
```

---

## Setup & Run Locally

### 1) Backend

```bash
cd AlgoGurukul/Backend
npm install
node src/index.js
```

Backend listens on `PORT` (default: `4000`).

### 2) Frontend

```bash
cd ../Frontend
npm install
npm run dev
```

Open the printed Vite URL in the browser.

---

## Deployment (Common)

This project is configured to support production origins (CORS origins are set in the backend). 

Recommended approach:

1. Deploy **Backend** to a Node-capable host (Render/Railway/etc.)
2. Deploy **Frontend** to Vercel/Netlify
3. Ensure `FRONTEND_URL` in backend `.env` and `VITE_API_URL` in frontend `.env` match your deployed backend URL.

---

## Backend Routes (Base Paths)

- `/user` (authentication/profile)
- `/problem` (problem CRUD)
- `/submission` (submit/run)
- `/ai` (AI)
- `/video` (video)

---

## Folder Structure

```text
AlgoGurukul/
  Backend/
  Frontend/
  README.md
```

---

## License

MIT

