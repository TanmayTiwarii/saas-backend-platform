# Student Portal API Platform

A production-ready Student Portal backend delivering secure REST APIs for students, teachers, and administrator workflows. Built with **Node.js**, **Express**, and **PostgreSQL** (via Prisma ORM).

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | JWT access tokens + refresh token rotation |
| **Token Security** | Refresh token reuse detection — revokes all tokens on suspected replay attack |
| **Password Reset** | Time-limited single-use reset tokens |
| **RBAC** | `ADMIN › TEACHER › STUDENT` role-based permissions |
| **Courses & Enrollment** | Teachers create courses; Students can enroll/unenroll self |
| **Assignments & Grading** | Teachers assign tasks, students submit content, teachers grade submissions |
| **Validation** | Per-route express-validator chains with structured 422 error responses |
| **Rate Limiting** | Global rate limiter + stricter auth limiter (20 req / 15 min) |
| **Security** | Helmet, CORS, body-size limits, no stack traces in production |
| **Logging** | Winston (colorized dev / JSON prod) + Morgan HTTP logs |
| **Database** | Prisma ORM with PostgreSQL, graceful connection shutdown |

---

## 🗂️ Project Structure

```
saas-backend-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.js                # Seed script (Admin, Teachers, Students, Courses, etc.)
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client singleton
│   │   ├── env.js             # Env var loader & validator
│   │   └── logger.js          # Winston logger config
│   ├── middleware/
│   │   ├── auth.js            # JWT verification → req.user
│   │   ├── authorize.js       # RBAC (requireMinRole, authorize)
│   │   ├── validate.js        # express-validator error handler
│   │   └── errorHandler.js    # Global error + 404 handler
│   ├── routes/
│   │   ├── auth.routes.js     # Auth, token rotation & password resets
│   │   ├── user.routes.js     # Profile management & Admin user controls
│   │   ├── course.routes.js   # Course creation, listing & enrollments
│   │   └── assignment.routes.js # Assignments creation & submission grading
│   ├── controllers/           # Route controller actions
│   ├── services/              # All business & database queries logic
│   ├── validators/            # Input validation schemas
│   ├── utils/
│   │   ├── response.js        # Standardized JSON response templates
│   │   └── tokens.js          # JWT sign & verify utilities
│   ├── app.js                 # Express application routing setup
│   └── server.js              # HTTP server starter & cleanup handles
└── .env.example
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, and PORT configuration
```

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run schema migrations
npm run db:seed        # Seed sample portal data (Users, Courses, Assignments)
```

### 4. Start the server

```bash
npm run dev            # Run in development mode (with nodemon auto-restart)
npm start              # Run in production mode
```

---

## 📡 API Reference

### 1. Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register a new user (defaults to `STUDENT` role) |
| `POST` | `/login` | ❌ | Login with email & password → Returns access + refresh tokens |
| `POST` | `/refresh` | ❌ | Rotate refresh token and get a new access token |
| `POST` | `/logout` | ❌ | Revoke the provided refresh token |
| `POST` | `/forgot-password` | ❌ | Trigger a password reset email/token |
| `POST` | `/reset-password` | ❌ | Reset password using valid reset token |

### 2. Users — `/api/users`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/me` | ✅ | Any | Retrieve authenticated user's profile with courses |
| `PATCH` | `/me` | ✅ | Any | Update profile details (first name, last name) |
| `DELETE` | `/me` | ✅ | Any | Deactivate own account |
| `GET` | `/` | ✅ | `ADMIN` | List all users (supports filtering by `?role=`) |
| `GET` | `/:id` | ✅ | `ADMIN` | Get any user details by ID |
| `PATCH` | `/:id/role` | ✅ | `ADMIN` | Update a user's role |

### 3. Courses — `/api/courses`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/` | ❌ | Public | List all active courses |
| `GET` | `/:id` | ❌ | Public | Get specific course details |
| `GET` | `/my/enrolled` | ✅ | `STUDENT`, `ADMIN` | Get courses enrolled by the logged-in student |
| `GET` | `/my/teaching` | ✅ | `TEACHER`, `ADMIN` | Get courses taught by the logged-in teacher |
| `POST` | `/` | ✅ | `TEACHER`+ | Create a new course |
| `PATCH` | `/:id` | ✅ | `TEACHER` (owner), `ADMIN` | Update course details |
| `DELETE` | `/:id` | ✅ | `TEACHER` (owner), `ADMIN` | Deactivate/delete a course |
| `POST` | `/:id/enroll` | ✅ | `STUDENT`, `ADMIN` | Enroll self in a course |
| `DELETE` | `/:id/enroll` | ✅ | `STUDENT`, `ADMIN` | Unenroll self from a course |
| `GET` | `/:id/students` | ✅ | `TEACHER` (owner), `ADMIN` | List all students enrolled in a course |

### 4. Assignments — `/api/assignments`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/course/:courseId` | ✅ | Any | List assignments for a specific course |
| `POST` | `/course/:courseId` | ✅ | `TEACHER` (owner), `ADMIN` | Create a new assignment for a course |
| `PATCH` | `/:id` | ✅ | `TEACHER` (owner), `ADMIN` | Update assignment details |
| `DELETE` | `/:id` | ✅ | `TEACHER` (owner), `ADMIN` | Delete assignment |
| `POST` | `/:id/submit` | ✅ | `STUDENT` | Submit work for an assignment |
| `GET` | `/:id/my-submission` | ✅ | `STUDENT` | View own submission & grade |
| `GET` | `/:id/submissions` | ✅ | `TEACHER` (owner), `ADMIN` | View all submissions for an assignment |
| `PATCH` | `/:id/submissions/:studentId/grade` | ✅ | `TEACHER` (owner), `ADMIN` | Grade and give feedback on a submission |

---

## 🛡️ Authentication Flow

```
Client                                  API
  │                                      │
  │────── POST /api/auth/login ─────────►│
  │◄───── { accessToken, refreshToken } ─┤
  │                                      │
  │────── GET /api/users/me ────────────►│
  │       Authorization: Bearer <accessToken>
  │◄───── 200 { user } ──────────────────┤
  │                                      │
  ╎     (accessToken expires in 15m)     ╎
  │                                      │
  │────── POST /api/auth/refresh ───────►│
  │       { refreshToken }               │
  │◄───── { accessToken (new), refreshToken (new) }
  │       (old refreshToken is marked revoked in DB)
```

## 🔐 Refresh Token Rotation & Reuse Detection

To maximize security:
1. When `/refresh` is called, the old token is permanently **revoked** in the database and a **new token pair** is issued.
2. If a previously revoked refresh token is presented again:
   - The server detects a potential **replay/token theft attack**.
   - The server immediately **invalidates all active refresh tokens** for that user, forcing a complete re-authentication on all devices.

---

## 🔧 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Auth**: `jsonwebtoken` + `bcryptjs`
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Logging**: `winston` + `morgan`
