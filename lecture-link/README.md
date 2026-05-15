# Lecture-Link 📚

A full-stack web platform for university lecture resource sharing. Students can access course materials, lecturers can upload resources, and admins manage the platform.

## Project Structure

```
lecture-link/
├── frontend/       # React + TypeScript + Vite app
└── backend/        # Node.js + Express API
```

---


---


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
