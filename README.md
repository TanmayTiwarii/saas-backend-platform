# SaaS Backend Platform

A production-ready SaaS backend delivering secure REST APIs for user, organization, and subscription workflows. Built with **Node.js**, **Express**, and **PostgreSQL** (via Prisma ORM).

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | JWT access tokens + refresh token rotation |
| **Token Security** | Refresh token reuse detection — revokes all tokens on suspected replay attack |
| **Password Reset** | Time-limited single-use reset tokens |
| **RBAC** | `SUPER_ADMIN › ADMIN › MEMBER › VIEWER` role hierarchy |
| **Middleware** | Reusable `authenticate`, `authorize`, `requireMinRole`, `authorizeOwnerOrAdmin` |
| **Validation** | Per-route express-validator chains with structured 422 error responses |
| **Rate Limiting** | Global limiter + stricter auth limiter (20 req / 15 min) |
| **Security** | Helmet, CORS, body-size limits, no stack traces in production |
| **Logging** | Winston (colorized dev / JSON prod) + Morgan HTTP logs |
| **Database** | Prisma ORM with PostgreSQL, graceful connection shutdown |

---

## 🗂️ Project Structure

```
saas-backend-platform/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Dev seed data
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client singleton
│   │   ├── env.js             # Env var loader & validator
│   │   └── logger.js          # Winston logger
│   ├── middleware/
│   │   ├── auth.js            # JWT verification → req.user
│   │   ├── authorize.js       # RBAC (authorize, requireMinRole, authorizeOwnerOrAdmin)
│   │   ├── validate.js        # express-validator error handler
│   │   └── errorHandler.js    # Global error + 404 handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── org.routes.js
│   │   └── subscription.routes.js
│   ├── controllers/           # Request/response handling (thin layer)
│   ├── services/              # All business logic lives here
│   ├── validators/            # express-validator rule chains
│   ├── utils/
│   │   ├── response.js        # Standardised JSON envelope helpers
│   │   └── tokens.js          # JWT sign/verify utilities
│   ├── app.js                 # Express app setup
│   └── server.js              # HTTP server + graceful shutdown
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
# Edit .env with your DATABASE_URL and JWT secrets
```

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed super admin + sample org
```

### 4. Start the server

```bash
npm run dev            # Development (nodemon)
npm start              # Production
```

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create account |
| `POST` | `/login` | ❌ | Login → access + refresh tokens |
| `POST` | `/refresh` | ❌ | Rotate refresh token |
| `POST` | `/logout` | ❌ | Revoke refresh token |
| `POST` | `/forgot-password` | ❌ | Trigger password reset |
| `POST` | `/reset-password` | ❌ | Set new password |

### Users — `/api/users`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/me` | ✅ | Any | Get own profile |
| `PATCH` | `/me` | ✅ | Any | Update name |
| `DELETE` | `/me` | ✅ | Any | Deactivate account |
| `GET` | `/` | ✅ | ADMIN+ | List all users |
| `GET` | `/:id` | ✅ | ADMIN+ | Get user by ID |
| `PATCH` | `/:id/role` | ✅ | SUPER_ADMIN | Change user role |

### Organizations — `/api/organizations`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/` | ✅ | Any | Create organization |
| `GET` | `/me` | ✅ | Any | Get own organization |
| `PATCH` | `/me` | ✅ | ADMIN+ | Update organization |
| `DELETE` | `/me` | ✅ | ADMIN+ | Deactivate organization |
| `GET` | `/:id/members` | ✅ | Any | List members |
| `POST` | `/:id/members` | ✅ | ADMIN+ | Invite member by email |
| `DELETE` | `/:id/members/:userId` | ✅ | ADMIN+ | Remove member |

### Subscriptions — `/api/subscriptions`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/plans` | ❌ | — | List all plans |
| `POST` | `/` | ✅ | ADMIN+ | Create subscription |
| `GET` | `/me` | ✅ | Any | Get own subscription |
| `PATCH` | `/me` | ✅ | ADMIN+ | Upgrade/downgrade plan |
| `DELETE` | `/me` | ✅ | ADMIN+ | Cancel subscription |

---

## 🛡️ Authentication Flow

```
Client                          API
  │──── POST /api/auth/login ────►│
  │◄─── { accessToken, refreshToken } ─┤
  │                                │
  │──── GET /api/users/me ─────────►│
  │     Authorization: Bearer <accessToken>
  │◄─── 200 { user } ──────────────┤
  │                                │
  ╎  (accessToken expires in 15m)  ╎
  │                                │
  │──── POST /api/auth/refresh ────►│
  │     { refreshToken }           │
  │◄─── { accessToken (new), refreshToken (new) }
  │     (old refreshToken is revoked in DB)
```

## 🔐 Refresh Token Rotation & Reuse Detection

On every `/refresh` call:
1. Old token is **revoked** in the database
2. A **new token pair** is returned
3. If a revoked token is presented again → **all user tokens are revoked** (suspected replay attack)

---

## 📦 Available Plans

| Plan | Seats | Features |
|------|-------|----------|
| FREE | 3 | basic_api |
| STARTER | 10 | basic_api, webhooks |
| PRO | 50 | + analytics |
| ENTERPRISE | ∞ | + sso, audit_logs |

---

## 🔧 Tech Stack

- **Runtime**: Node.js v22
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: jsonwebtoken + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: Winston + Morgan
