# 🌻 TaskWarm – Backend API

**MERN Stack Task Manager – Node.js / Express / MongoDB / JWT**

---

## 📁 Project Structure

```
taskwarm-backend/
├── server.js                  ← Entry point
├── package.json
├── .env.example               ← Copy to .env and fill in your values
├── config/
│   └── db.js                  ← MongoDB connection
├── models/
│   ├── User.js                ← User schema (bcrypt + JWT methods)
│   └── Task.js                ← Task schema with indexes
├── controllers/
│   ├── authController.js      ← register, login, getMe, updateProfile
│   └── taskController.js      ← CRUD + filtering/sorting + stats
├── routes/
│   ├── authRoutes.js          ← /api/auth/*
│   └── taskRoutes.js          ← /api/tasks/*
└── middleware/
    └── authMiddleware.js      ← JWT protect middleware
```

---

## ⚙️ Setup & Installation

### 1. Clone and install dependencies
```bash
cd taskwarm-backend
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- **MONGO_URI** – your MongoDB Atlas connection string
- **JWT_SECRET** – any long random string (keep it secret!)
- **PORT** – default is 5000

### 3. Start the server
```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

Server will start at: `http://localhost:5000`

---

## 🌐 API Reference

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Routes — `/api/auth`

#### Register
```
POST /api/auth/register
Body: { "name": "Sneha", "email": "sneha@example.com", "password": "secret123" }

Response 201:
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Sneha", "email": "sneha@example.com" }
}
```

#### Login
```
POST /api/auth/login
Body: { "email": "sneha@example.com", "password": "secret123" }

Response 200:
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Sneha", "email": "sneha@example.com" }
}
```

#### Get Current User  *(protected)*
```
GET /api/auth/me

Response 200:
{
  "success": true,
  "user": { "id": "...", "name": "Sneha", "email": "...", "createdAt": "..." }
}
```

#### Update Profile  *(protected)*
```
PUT /api/auth/update
Body: { "name": "New Name", "currentPassword": "old", "newPassword": "new123" }
```

---

### ✅ Task Routes — `/api/tasks`  *(all protected)*

#### Get All Tasks
```
GET /api/tasks
GET /api/tasks?status=todo
GET /api/tasks?priority=high
GET /api/tasks?search=frontend
GET /api/tasks?sortBy=due&order=asc
GET /api/tasks?status=inprogress&sortBy=priority

Response 200:
{
  "success": true,
  "count": 3,
  "data": [ { ...task }, ... ]
}
```

**Query params:**

| Param    | Values                          | Description                  |
|----------|---------------------------------|------------------------------|
| status   | todo / inprogress / done        | Filter by status             |
| priority | high / med / low                | Filter by priority           |
| category | any string                      | Filter by category (partial) |
| search   | any string                      | Search title + description   |
| sortBy   | createdAt / due / priority / title | Sort field               |
| order    | asc / desc                      | Sort direction               |

#### Get Task Stats
```
GET /api/tasks/stats

Response 200:
{
  "success": true,
  "data": {
    "total": 8,
    "overdue": 2,
    "byStatus":   { "todo": 4, "inprogress": 2, "done": 2 },
    "byPriority": { "high": 3, "med": 3, "low": 2 }
  }
}
```

#### Get Single Task
```
GET /api/tasks/:id
```

#### Create Task
```
POST /api/tasks
Body:
{
  "title":    "Build login UI",       ← required
  "desc":     "React form with JWT",  ← optional
  "status":   "todo",                 ← optional, default: "todo"
  "priority": "high",                 ← optional, default: "med"
  "category": "Frontend",             ← optional
  "due":      "2025-06-20"            ← optional, ISO date
}

Response 201: { "success": true, "data": { ...task } }
```

#### Update Task
```
PUT /api/tasks/:id
Body: any subset of task fields

Response 200: { "success": true, "data": { ...updatedTask } }
```

#### Delete Task
```
DELETE /api/tasks/:id

Response 200: { "success": true, "message": "Task deleted successfully" }
```

---

## 🔌 Connecting to Your React Frontend

In your React app, replace the localStorage auth with real API calls:

```js
// ── login ─────────────────────────────────────────
const res = await fetch('http://localhost:5000/api/auth/login', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ email, password }),
});
const data = await res.json();
localStorage.setItem('tw_token', data.token);

// ── fetch tasks ───────────────────────────────────
const token = localStorage.getItem('tw_token');
const res = await fetch('http://localhost:5000/api/tasks', {
  headers: { Authorization: `Bearer ${token}` },
});

// ── create task ───────────────────────────────────
await fetch('http://localhost:5000/api/tasks', {
  method:  'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${token}`,
  },
  body: JSON.stringify({ title, desc, status, priority, category, due }),
});
```

---

## 🛠️ Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Runtime        | Node.js                        |
| Framework      | Express.js 4                   |
| Database       | MongoDB (via Mongoose 8)       |
| Authentication | JSON Web Tokens (JWT)          |
| Password Hash  | bcryptjs                       |
| Validation     | express-validator              |
| Dev Server     | nodemon                        |

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds = 10) before saving
- JWT tokens expire after **7 days** (configurable via `JWT_EXPIRE`)
- Every task query is scoped to `req.user._id` — users can only see their own tasks
- Input validation on all write endpoints via **express-validator**
- `password` field has `select: false` so it is never returned in API responses

---

*Built for TaskWarm MERN Project · NIT Hamirpur*
