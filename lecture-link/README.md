# Lecture-Link 📚

A full-stack web platform for university lecture resource sharing. Students can access course materials, lecturers can upload resources, and admins manage the platform.

## Project Structure

```
lecture-link/
├── frontend/       # React + TypeScript + Vite app
└── backend/        # Node.js + Express API
```

---

## 🚀 Deploying to Render (Step-by-Step)

You will deploy **two separate services** on Render:
1. **Backend** → a Web Service (Node.js)
2. **Frontend** → a Static Site (React)

---

### Step 1: Push to GitHub

1. Create a new repository on [github.com](https://github.com) — call it `lecture-link`
2. Open a terminal on your computer and run:

```bash
cd path/to/lecture-link
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lecture-link.git
git push -u origin main
```

---

### Step 2: Deploy the Backend on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (`lecture-link`)
4. Fill in these settings:
   - **Name**: `lecture-link-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **"Advanced"** → **"Add Environment Variable"** and add:
   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `JWT_SECRET` | *(any long random string, e.g. `mySecretKey2024abc`)* |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | *(leave blank for now — you'll fill this in after deploying frontend)* |
6. Click **"Create Web Service"**
7. Wait for it to deploy. Copy the URL it gives you (e.g. `https://lecture-link-backend.onrender.com`)

---

### Step 3: Deploy the Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repo (`lecture-link`)
3. Fill in these settings:
   - **Name**: `lecture-link-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click **"Advanced"** → **"Add Environment Variable"** and add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://lecture-link-backend.onrender.com/api` *(your backend URL + /api)* |
5. Click **"Create Static Site"**
6. Wait for it to deploy. Copy the URL (e.g. `https://lecture-link-frontend.onrender.com`)

---

### Step 4: Connect Frontend URL to Backend

1. Go back to your **Backend** service on Render
2. Click **"Environment"** on the left sidebar
3. Update `FRONTEND_URL` with your frontend URL (e.g. `https://lecture-link-frontend.onrender.com`)
4. Render will automatically redeploy the backend

---

### Step 5: Fix Page Refresh (404 Issue)

Since the frontend is a single-page app, you need to add a redirect rule so refreshing any page works:

1. In your **Static Site** settings on Render, click **"Redirects/Rewrites"**
2. Add a rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
3. Save

---

## ✅ You're Live!

Visit your frontend URL — the Kimi branding and agent will be completely gone.

---

## 🔑 Default Admin Login

```
Email: admin@lcu.edu.ng
Password: admin123
```

> ⚠️ Change this password immediately after first login!

---

## 💻 Running Locally

### Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Make sure the frontend `.env` file has:
```
VITE_API_URL=http://localhost:5000/api
```
